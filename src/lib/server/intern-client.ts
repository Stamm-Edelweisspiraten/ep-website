/**
 * Kern des API-Clients für den Intern-Bereich – ohne SvelteKit-Abhängigkeiten, damit er sich
 * mit gemocktem `fetch` testen lässt. Die Website nutzt ihn über `intern.ts`.
 */

export type QueryValue = string | number | boolean | null | undefined;
export type Query = Record<string, QueryValue>;

export class InternApiError extends Error {
	readonly status: number;
	readonly code: string | null;
	readonly path: string;

	constructor(status: number, message: string, path: string, code: string | null = null) {
		super(message);
		this.name = 'InternApiError';
		this.status = status;
		this.code = code;
		this.path = path;
	}
}

export interface InternClientOptions {
	/** Basis-URL ohne abschließenden Schrägstrich, z. B. `http://intern:3000` */
	baseUrl: string | undefined;
	apiKey: string | undefined;
	fetch?: typeof fetch;
	/** Standard-Cache-Dauer in Millisekunden (Standard 60 000) */
	ttlMs?: number;
	/** Zeitlimit je Anfrage in Millisekunden (Standard 5000) */
	timeoutMs?: number;
	/** Dauer, für die ein 404 bei Bildern gemerkt wird (Standard 60 000) */
	notFoundTtlMs?: number;
	/** Höchstzahl der Cache-Einträge (Standard 500, älteste fliegen zuerst) */
	maxEntries?: number;
	now?: () => number;
	logger?: Pick<Console, 'warn' | 'error'>;
}

export interface JsonOptions {
	/** Abweichende Cache-Dauer in Millisekunden; 0 = nicht cachen */
	ttlMs?: number;
}

export interface BinaryResult {
	body: ReadableStream<Uint8Array>;
	contentType: string;
	contentLength: string | null;
}

interface CacheEntry {
	value: unknown;
	expires: number;
}

/** Nur Website-Endpunkte sind erlaubt – der Key soll nichts anderes abrufen können. */
const ALLOWED_PATH = /^\/api\/v1\/modules\/[a-z0-9-]+\/website\/[A-Za-z0-9/_.%-]*$/;

export function buildPath(path: string, query?: Query): string {
	if (!ALLOWED_PATH.test(path) || path.includes('..')) {
		throw new InternApiError(400, `Unzulässiger API-Pfad: ${path}`, path, 'bad_path');
	}
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(query ?? {}).sort(([a], [b]) => a.localeCompare(b))) {
		if (value === undefined || value === null || value === '') continue;
		params.set(key, String(value));
	}
	const qs = params.toString();
	return qs ? `${path}?${qs}` : path;
}

function errorMessage(body: unknown): { message: string | null; code: string | null } {
	if (body && typeof body === 'object' && 'error' in body) {
		const error = (body as { error: unknown }).error;
		if (error && typeof error === 'object') {
			const e = error as { message?: unknown; code?: unknown };
			return {
				message: typeof e.message === 'string' ? e.message : null,
				code: typeof e.code === 'string' ? e.code : null
			};
		}
	}
	return { message: null, code: null };
}

export function createInternClient(options: InternClientOptions) {
	const doFetch = options.fetch ?? globalThis.fetch;
	const ttlMs = options.ttlMs ?? 60_000;
	const timeoutMs = options.timeoutMs ?? 5_000;
	const notFoundTtlMs = options.notFoundTtlMs ?? 60_000;
	const maxEntries = options.maxEntries ?? 500;
	const now = options.now ?? Date.now;
	const log = options.logger ?? console;
	const baseUrl = options.baseUrl?.trim().replace(/\/+$/, '') ?? '';
	const apiKey = options.apiKey?.trim() ?? '';

	const cache = new Map<string, CacheEntry>();
	const inflight = new Map<string, Promise<unknown>>();
	const notFound = new Map<string, number>();
	let warnedConfig = false;

	function assertConfigured(path: string) {
		if (baseUrl && apiKey) return;
		if (!warnedConfig) {
			warnedConfig = true;
			log.error(
				'[intern] INTERN_API_URL und/oder INTERN_API_KEY fehlen – Inhalte aus dem Intern-Bereich ' +
					'können nicht geladen werden (siehe website/.env.example).'
			);
		}
		throw new InternApiError(503, 'Intern-API ist nicht konfiguriert', path, 'not_configured');
	}

	async function request(path: string, accept: string): Promise<Response> {
		assertConfigured(path);
		let response: Response;
		try {
			response = await doFetch(`${baseUrl}${path}`, {
				headers: { authorization: `Bearer ${apiKey}`, accept },
				signal: AbortSignal.timeout(timeoutMs)
			});
		} catch (err) {
			const timeout = err instanceof Error && err.name === 'TimeoutError';
			throw new InternApiError(
				timeout ? 504 : 502,
				timeout ? 'Zeitüberschreitung beim Intern-Bereich' : 'Intern-Bereich nicht erreichbar',
				path,
				timeout ? 'timeout' : 'network'
			);
		}
		if (!response.ok) {
			let body: unknown = null;
			try {
				body = await response.json();
			} catch {
				// kein JSON-Fehlerkörper
			}
			const { message, code } = errorMessage(body);
			throw new InternApiError(
				response.status,
				message ?? `Intern-API antwortete mit ${response.status}`,
				path,
				code
			);
		}
		return response;
	}

	function remember(key: string, value: unknown, ttl: number) {
		cache.delete(key);
		cache.set(key, { value, expires: now() + ttl });
		while (cache.size > maxEntries) {
			const oldest = cache.keys().next().value;
			if (oldest === undefined) break;
			cache.delete(oldest);
		}
	}

	async function fetchJson(fullPath: string): Promise<unknown> {
		const response = await request(fullPath, 'application/json');
		let body: unknown;
		try {
			body = await response.json();
		} catch {
			throw new InternApiError(502, 'Ungültige Antwort des Intern-Bereichs', fullPath, 'bad_json');
		}
		if (!body || typeof body !== 'object' || !('data' in body)) {
			throw new InternApiError(502, 'Antwort ohne „data“', fullPath, 'bad_json');
		}
		return (body as { data: unknown }).data;
	}

	/**
	 * JSON-Endpunkt abrufen und `{ data }` entpacken. Ergebnisse werden zwischengespeichert;
	 * gleichzeitige gleiche Anfragen teilen sich einen Abruf. Bei Fehlern wird – falls vorhanden –
	 * der letzte gute Wert geliefert (außer bei 404).
	 */
	async function internJson<T>(path: string, query?: Query, opts: JsonOptions = {}): Promise<T> {
		const key = buildPath(path, query);
		const ttl = opts.ttlMs ?? ttlMs;
		const entry = cache.get(key);
		if (entry && entry.expires > now()) return entry.value as T;

		const running = inflight.get(key);
		if (running) return running as Promise<T>;

		const promise = (async () => {
			try {
				const value = await fetchJson(key);
				if (ttl > 0) remember(key, value, ttl);
				return value;
			} catch (err) {
				if (err instanceof InternApiError && err.status === 404) {
					cache.delete(key);
					throw err;
				}
				const stale = cache.get(key);
				if (stale) {
					log.warn(
						`[intern] ${key}: ${err instanceof Error ? err.message : String(err)} – liefere zwischengespeicherten Stand`
					);
					return stale.value;
				}
				throw err;
			} finally {
				inflight.delete(key);
			}
		})();
		inflight.set(key, promise);
		return promise as Promise<T>;
	}

	/** Binärdatei (Bild) abrufen; `null` bei 404 (wird kurz gemerkt). Kein Inhalts-Cache. */
	async function internBinary(path: string, query?: Query): Promise<BinaryResult | null> {
		const key = buildPath(path, query);
		const missing = notFound.get(key);
		if (missing !== undefined) {
			if (missing > now()) return null;
			notFound.delete(key);
		}
		let response: Response;
		try {
			response = await request(key, 'image/*');
		} catch (err) {
			if (err instanceof InternApiError && err.status === 404) {
				notFound.set(key, now() + notFoundTtlMs);
				while (notFound.size > maxEntries) {
					const oldest = notFound.keys().next().value;
					if (oldest === undefined) break;
					notFound.delete(oldest);
				}
				return null;
			}
			throw err;
		}
		if (!response.body) {
			throw new InternApiError(502, 'Leere Antwort des Intern-Bereichs', key, 'empty');
		}
		return {
			body: response.body,
			contentType: response.headers.get('content-type') ?? 'application/octet-stream',
			contentLength: response.headers.get('content-length')
		};
	}

	function clearCache() {
		cache.clear();
		notFound.clear();
	}

	return { internJson, internBinary, clearCache, configured: Boolean(baseUrl && apiKey) };
}

export type InternClient = ReturnType<typeof createInternClient>;

/** Ergebnis von `safe`: bei Fehlern der Ersatzwert und `error: true` (Seite zeigt einen Hinweis). */
export interface SafeResult<T> {
	value: T;
	error: boolean;
}

export async function safe<T>(
	promise: Promise<T>,
	fallback: T,
	logger: Pick<Console, 'warn'> = console
): Promise<SafeResult<T>> {
	try {
		return { value: await promise, error: false };
	} catch (err) {
		const detail =
			err instanceof InternApiError
				? `${err.status}${err.code ? ` ${err.code}` : ''} ${err.path}: ${err.message}`
				: err instanceof Error
					? err.message
					: String(err);
		logger.warn(`[intern] Laden fehlgeschlagen – ${detail}`);
		return { value: fallback, error: true };
	}
}

/**
 * Gibt bei 404 `null` zurück, wirft sonst weiter. Ein deaktiviertes Modul (`module_disabled`)
 * gilt als Ausfall, nicht als „nicht gefunden“.
 */
export async function orNull<T>(promise: Promise<T>): Promise<T | null> {
	try {
		return await promise;
	} catch (err) {
		if (err instanceof InternApiError && err.status === 404 && err.code !== 'module_disabled') {
			return null;
		}
		throw err;
	}
}
