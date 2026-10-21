/**
 * Bild-Cache des Bild-Proxys (rein, ohne SvelteKit-Importe – getestet in `tests/unit/website-cache.test.ts`).
 *
 * Galeriebilder sind unter ihrer ID unveränderlich (ein neues Bild bekommt eine neue ID), Gruppenbilder tragen die
 * Version `?v=` im Schlüssel. Deshalb holt der Proxy jedes Bild höchstens einmal je Cache-Dauer beim Backend und
 * liefert es danach aus dem Arbeitsspeicher (LRU nach Bytes) – mit ETag, damit Browser nur noch `304` bekommen.
 * Die Cache-Dauer ist bewusst begrenzt (Standard 1 h): wird eine Galerie privat oder ein Bild gelöscht, verschwindet
 * es spätestens danach auch von der Website.
 */
import { createHash } from 'node:crypto';
import { createCachedLoader, type CachedLoader } from './cache';

export interface CachedImage {
	bytes: Uint8Array;
	type: string;
	etag: string;
}

/** Größtes Bild, das der Proxy annimmt (Galerie `web` liegt weit darunter) */
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

export class ImageUpstreamError extends Error {}

/** Backend-Antwort lesen und prüfen; `null` = gibt es nicht (404). */
export async function readImage(res: Response | null): Promise<CachedImage | null> {
	if (!res) return null;
	const type = (res.headers.get('content-type') ?? '').split(';')[0]!.trim().toLowerCase();
	if (!/^image\/[a-z0-9.+-]+$/.test(type) || type === 'image/svg+xml') {
		throw new ImageUpstreamError('Ungültige Antwort');
	}
	const length = Number(res.headers.get('content-length') ?? '0');
	if (length > MAX_IMAGE_BYTES) throw new ImageUpstreamError('Bild zu groß');
	const bytes = new Uint8Array(await res.arrayBuffer());
	if (bytes.byteLength > MAX_IMAGE_BYTES) throw new ImageUpstreamError('Bild zu groß');
	const etag = `"${createHash('sha256').update(bytes).digest('base64url').slice(0, 32)}"`;
	return { bytes, type, etag };
}

export function createImageCache(options: {
	ttlMs: number;
	notFoundTtlMs: number;
	maxBytes: number;
	maxEntries?: number;
	now?: () => number;
}): CachedLoader<CachedImage | null> {
	return createCachedLoader<CachedImage | null>({
		ttlMs: (img) => (img ? options.ttlMs : options.notFoundTtlMs),
		negativeTtlMs: options.notFoundTtlMs,
		errorTtlMs: 5_000,
		maxEntries: options.maxEntries ?? 5_000,
		maxBytes: options.maxBytes,
		sizeOf: (img) => (img ? img.bytes.byteLength + 200 : 100),
		now: options.now
	});
}

/** Antwort an den Browser; `If-None-Match` → `304`. */
export function imageResponse(
	img: CachedImage,
	request: Request,
	cacheControl = 'public, max-age=86400, stale-while-revalidate=604800'
): Response {
	const headers = {
		etag: img.etag,
		'cache-control': cacheControl,
		'x-content-type-options': 'nosniff'
	};
	const match = request.headers.get('if-none-match');
	if (match && match.split(',').some((t) => t.trim().replace(/^W\//, '') === img.etag)) {
		return new Response(null, { status: 304, headers });
	}
	return new Response(img.bytes as unknown as BodyInit, {
		headers: { ...headers, 'content-type': img.type, 'content-length': String(img.bytes.byteLength) }
	});
}
