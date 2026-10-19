/**
 * Bild-Proxy für `/bilder/…`: holt Bilder mit dem API-Key aus dem Intern-Bereich und hält sie in
 * einem kleinen In-Memory-LRU (Rate-Limit der API: 600 Bilder/60 s je Key).
 *
 * - Gesamtgröße Standard 100 MB (Env `IMAGE_CACHE_MB`, `0` schaltet den Cache ab), TTL 1 h,
 *   nur erfolgreiche Antworten, je Bild höchstens 5 MB (größere werden ausgeliefert, nicht gemerkt).
 * - Gleichzeitige Anfragen nach demselben Bild teilen sich einen Abruf (Request-Zusammenlegung).
 * - 404 merkt sich bereits der API-Client (`internBinary`, 60 s).
 */
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { buildPath, InternApiError, type BinaryResult, type Query } from './intern-client';
import { internBinary } from './intern';

const ALLOWED_TYPES = /^image\/(webp|jpeg|png|avif|gif)$/;
const MB = 1024 * 1024;

export const IMAGE_CACHE_DEFAULTS = {
	maxBytes: 100 * MB,
	ttlMs: 60 * 60 * 1000,
	maxItemBytes: 5 * MB,
	/** Harte Obergrenze für ein einzelnes Bild beim Einlesen */
	maxReadBytes: 30 * MB
} as const;

// --- LRU ---------------------------------------------------------------------------

export interface CachedImage {
	bytes: Uint8Array;
	contentType: string;
}

interface Entry extends CachedImage {
	expires: number;
}

export interface ImageCacheOptions {
	maxBytes?: number;
	ttlMs?: number;
	maxItemBytes?: number;
	now?: () => number;
}

/** LRU nach Gesamtgröße in Bytes mit TTL. */
export function createImageCache(options: ImageCacheOptions = {}) {
	const maxBytes = Math.max(0, options.maxBytes ?? IMAGE_CACHE_DEFAULTS.maxBytes);
	const ttlMs = options.ttlMs ?? IMAGE_CACHE_DEFAULTS.ttlMs;
	const maxItemBytes = Math.min(
		options.maxItemBytes ?? IMAGE_CACHE_DEFAULTS.maxItemBytes,
		maxBytes
	);
	const now = options.now ?? Date.now;
	const entries = new Map<string, Entry>();
	let size = 0;

	function drop(key: string) {
		const entry = entries.get(key);
		if (!entry) return;
		entries.delete(key);
		size -= entry.bytes.byteLength;
	}

	return {
		get(key: string): CachedImage | null {
			const entry = entries.get(key);
			if (!entry) return null;
			if (entry.expires <= now()) {
				drop(key);
				return null;
			}
			// als zuletzt benutzt ans Ende
			entries.delete(key);
			entries.set(key, entry);
			return entry;
		},
		/** `true`, wenn gespeichert (zu große Bilder bzw. abgeschalteter Cache → `false`). */
		set(key: string, image: CachedImage): boolean {
			drop(key);
			const bytes = image.bytes.byteLength;
			if (maxBytes === 0 || bytes > maxItemBytes) return false;
			while (size + bytes > maxBytes) {
				const oldest = entries.keys().next().value;
				if (oldest === undefined) break;
				drop(oldest);
			}
			entries.set(key, { ...image, expires: now() + ttlMs });
			size += bytes;
			return true;
		},
		clear() {
			entries.clear();
			size = 0;
		},
		get size() {
			return size;
		},
		get count() {
			return entries.size;
		}
	};
}

export type ImageCache = ReturnType<typeof createImageCache>;

// --- Proxy -------------------------------------------------------------------------

/** `null` = 404 */
type Loaded = CachedImage | null;

export interface ImageProxyOptions {
	fetchBinary: (path: string, query?: Query) => Promise<BinaryResult | null>;
	cache: ImageCache;
	maxReadBytes?: number;
	logger?: Pick<Console, 'warn'>;
}

async function readAll(body: ReadableStream<Uint8Array>, limit: number): Promise<Uint8Array> {
	const reader = body.getReader();
	const chunks: Uint8Array[] = [];
	let total = 0;
	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		total += value.byteLength;
		if (total > limit) {
			await reader.cancel();
			throw new InternApiError(502, 'Bild ist zu groß', '', 'too_large');
		}
		chunks.push(value);
	}
	const bytes = new Uint8Array(total);
	let offset = 0;
	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return bytes;
}

function imageResponse(image: CachedImage, cacheStatus: 'HIT' | 'MISS'): Response {
	return new Response(image.bytes as BodyInit, {
		status: 200,
		headers: {
			'content-type': image.contentType,
			'content-length': String(image.bytes.byteLength),
			'cache-control': 'public, max-age=3600, stale-while-revalidate=86400',
			'x-content-type-options': 'nosniff',
			'content-security-policy': "default-src 'none'; sandbox",
			'x-cache': cacheStatus
		}
	});
}

/** Proxy mit eigenem Cache und Zusammenlegung (für Tests mit gemocktem `fetchBinary`). */
export function createImageProxy(options: ImageProxyOptions) {
	const { fetchBinary, cache } = options;
	const maxReadBytes = options.maxReadBytes ?? IMAGE_CACHE_DEFAULTS.maxReadBytes;
	const log = options.logger ?? console;
	const inflight = new Map<string, Promise<Loaded>>();

	async function load(path: string, query: Query | undefined, key: string): Promise<Loaded> {
		let result: BinaryResult | null;
		try {
			result = await fetchBinary(path, query);
		} catch (err) {
			const status = err instanceof InternApiError ? err.status : 502;
			log.warn(`[bilder] ${path}: ${err instanceof Error ? err.message : String(err)}`);
			error(status === 503 ? 503 : 502, 'Bild konnte gerade nicht geladen werden');
		}
		if (!result) return null;

		const contentType = result.contentType.split(';')[0]!.trim().toLowerCase();
		if (!ALLOWED_TYPES.test(contentType)) {
			await result.body.cancel();
			error(502, 'Unerwarteter Bildtyp');
		}
		let bytes: Uint8Array;
		try {
			bytes = await readAll(result.body, maxReadBytes);
		} catch (err) {
			log.warn(`[bilder] ${path}: ${err instanceof Error ? err.message : String(err)}`);
			error(502, 'Bild konnte gerade nicht geladen werden');
		}
		const image = { bytes, contentType };
		cache.set(key, image);
		return image;
	}

	/** Bild ausliefern: Cache → laufender Abruf → neuer Abruf; 404 bleibt 404. */
	async function proxyImage(path: string, query?: Query): Promise<Response> {
		const key = buildPath(path, query);
		const cached = cache.get(key);
		if (cached) return imageResponse(cached, 'HIT');

		let promise = inflight.get(key);
		if (!promise) {
			promise = load(path, query, key).finally(() => inflight.delete(key));
			inflight.set(key, promise);
		}
		const image = await promise;
		if (!image) error(404, 'Bild nicht gefunden');
		return imageResponse(image, 'MISS');
	}

	return { proxyImage, cache };
}

/** `IMAGE_CACHE_MB` lesen; ungültig/leer → Standard, `0` → aus. */
export function cacheBytesFromEnv(value: string | undefined): number {
	if (value === undefined || value.trim() === '') return IMAGE_CACHE_DEFAULTS.maxBytes;
	const mb = Number(value);
	return Number.isFinite(mb) && mb >= 0 ? Math.floor(mb * MB) : IMAGE_CACHE_DEFAULTS.maxBytes;
}

let defaultProxy: ReturnType<typeof createImageProxy> | null = null;

function getDefaultProxy() {
	if (!defaultProxy) {
		defaultProxy = createImageProxy({
			fetchBinary: internBinary,
			cache: createImageCache({ maxBytes: cacheBytesFromEnv(env.IMAGE_CACHE_MB) })
		});
	}
	return defaultProxy;
}

/** Bild aus dem Intern-Bereich ausliefern (mit Cache), 404 bleibt 404. */
export function proxyImage(path: string, query?: Query): Promise<Response> {
	return getDefaultProxy().proxyImage(path, query);
}
