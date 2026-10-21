/**
 * Zwischenspeicher für Abrufe beim Backend (rein, ohne SvelteKit-Importe – getestet in der Root-Suite,
 * `tests/unit/website-cache.test.ts`).
 *
 * - Erfolge werden `ttlMs` lang gehalten (LRU nach Anzahl und optional nach Bytes).
 * - **Negative Antworten** (z. B. 404 auf eine unbekannte ID) werden `negativeTtlMs` lang gemerkt: tausend Anfragen
 *   auf dieselbe falsche ID erzeugen nur einen Backend-Abruf.
 * - **In-Flight-Deduplizierung**: gleichzeitige Anfragen auf denselben Schlüssel teilen sich einen Abruf (keine Stampede).
 * - Bei anderen Fehlern (Backend weg, 429, 5xx) wird der letzte gute Stand geliefert („stale on error“) und erst nach
 *   `errorTtlMs` erneut gefragt; ohne alten Stand wird der Fehler `errorTtlMs` lang gemerkt.
 */

export interface CachedLoaderOptions<V> {
	/** Lebensdauer eines Erfolgs in ms (fest oder je Wert) */
	ttlMs: number | ((value: V) => number);
	/** Lebensdauer einer negativen Antwort (`isNegative`) in ms */
	negativeTtlMs: number;
	/** Wie lange ein sonstiger Fehler (bzw. der danach gelieferte alte Stand) gilt, bevor neu gefragt wird */
	errorTtlMs?: number;
	/** Höchstzahl Einträge (LRU) */
	maxEntries: number;
	/** Gesamtgröße in Bytes (LRU), zusammen mit `sizeOf` */
	maxBytes?: number;
	/** Größe eines Werts in Bytes; Werte über einem Viertel von `maxBytes` werden nicht gespeichert */
	sizeOf?: (value: V) => number;
	/** Fehler, die als „gibt es nicht“ gelten und kurz gemerkt werden (alter Stand wird dann verworfen) */
	isNegative?: (error: unknown) => boolean;
	/** Uhr (für Tests) */
	now?: () => number;
}

type Entry<V> =
	| { kind: 'value'; value: V; expires: number; size: number }
	| { kind: 'error'; error: unknown; expires: number; size: 0 };

export interface CachedLoader<V> {
	get(key: string, load: () => Promise<V>): Promise<V>;
	/** Anzahl der Einträge (für Tests/Diagnose) */
	readonly size: number;
	/** Belegte Bytes (nur mit `sizeOf`) */
	readonly bytes: number;
	clear(): void;
}

export function createCachedLoader<V>(options: CachedLoaderOptions<V>): CachedLoader<V> {
	const now = options.now ?? Date.now;
	const errorTtl = options.errorTtlMs ?? 5_000;
	const entries = new Map<string, Entry<V>>();
	const inflight = new Map<string, Promise<V>>();
	let bytes = 0;

	const ttlOf = (value: V) =>
		typeof options.ttlMs === 'function' ? options.ttlMs(value) : options.ttlMs;

	function remove(key: string) {
		const old = entries.get(key);
		if (!old) return;
		bytes -= old.size;
		entries.delete(key);
	}

	function store(key: string, entry: Entry<V>) {
		remove(key);
		if (options.maxBytes !== undefined && entry.size > options.maxBytes / 4) return;
		entries.set(key, entry);
		bytes += entry.size;
		while (
			entries.size > options.maxEntries ||
			(options.maxBytes !== undefined && bytes > options.maxBytes)
		) {
			const oldest = entries.keys().next().value;
			if (oldest === undefined) break;
			remove(oldest);
		}
	}

	async function refresh(key: string, load: () => Promise<V>, stale: Entry<V> | undefined) {
		try {
			const value = await load();
			const size = options.sizeOf ? options.sizeOf(value) : 0;
			store(key, { kind: 'value', value, expires: now() + ttlOf(value), size });
			return value;
		} catch (error) {
			if (options.isNegative?.(error)) {
				store(key, { kind: 'error', error, expires: now() + options.negativeTtlMs, size: 0 });
				throw error;
			}
			if (stale?.kind === 'value') {
				// letzten guten Stand weiter ausliefern, aber das Backend nicht bei jeder Anfrage neu fragen
				store(key, { ...stale, expires: now() + errorTtl });
				return stale.value;
			}
			store(key, { kind: 'error', error, expires: now() + errorTtl, size: 0 });
			throw error;
		}
	}

	return {
		get(key, load) {
			const entry = entries.get(key);
			if (entry && entry.expires > now()) {
				// LRU: zuletzt benutzt ans Ende
				entries.delete(key);
				entries.set(key, entry);
				return entry.kind === 'value' ? Promise.resolve(entry.value) : Promise.reject(entry.error);
			}
			const pending = inflight.get(key);
			if (pending) return pending;
			const promise = refresh(key, load, entry).finally(() => inflight.delete(key));
			inflight.set(key, promise);
			return promise;
		},
		get size() {
			return entries.size;
		},
		get bytes() {
			return bytes;
		},
		clear() {
			entries.clear();
			inflight.clear();
			bytes = 0;
		}
	};
}

// --- Rate-Limit je Besucher-IP ------------------------------------------------------------------

export interface RateLimiter {
	/** `true`, wenn die Anfrage erlaubt ist; zählt sie dabei mit */
	hit(key: string): { allowed: boolean; retryAfterSec: number };
	readonly size: number;
}

/**
 * Festes Zeitfenster je Schlüssel (z. B. `bilder:<ip>`), im Arbeitsspeicher. Höchstens `maxKeys` Schlüssel –
 * abgelaufene werden beim Überlauf zuerst entfernt, danach die ältesten.
 */
export function createRateLimiter(options: {
	limit: number;
	windowMs: number;
	maxKeys?: number;
	now?: () => number;
}): RateLimiter {
	const now = options.now ?? Date.now;
	const maxKeys = options.maxKeys ?? 10_000;
	const windows = new Map<string, { count: number; resetAt: number }>();

	function prune(t: number) {
		for (const [key, w] of windows) if (w.resetAt <= t) windows.delete(key);
		while (windows.size >= maxKeys) {
			const oldest = windows.keys().next().value;
			if (oldest === undefined) break;
			windows.delete(oldest);
		}
	}

	return {
		hit(key) {
			const t = now();
			let w = windows.get(key);
			if (!w || w.resetAt <= t) {
				if (w) windows.delete(key);
				if (windows.size >= maxKeys) prune(t);
				w = { count: 0, resetAt: t + options.windowMs };
				windows.set(key, w);
			}
			w.count++;
			return {
				allowed: w.count <= options.limit,
				retryAfterSec: Math.max(1, Math.ceil((w.resetAt - t) / 1000))
			};
		},
		get size() {
			return windows.size;
		}
	};
}

// --- IDs vorab prüfen ---------------------------------------------------------------------------

/** UUID (Termine, Galerien, Bilder); alles andere erreicht das Backend gar nicht erst */
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Adresse einer Gruppe */
export const SLUG_RE = /^[a-z0-9-]{1,80}$/;
/** Termin-Adresse: `<uuid>` oder bei Serien `<uuid>~<YYYY-MM-DD>` */
export const EVENT_KEY_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(~\d{4}-\d{2}-\d{2})?$/i;
