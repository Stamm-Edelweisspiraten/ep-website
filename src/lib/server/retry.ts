/**
 * Wiederholung bei vorübergehenden Backend-Fehlern (rein, ohne SvelteKit-Importe – getestet in
 * `tests/unit/website-retry.test.ts` des Hauptprojekts).
 *
 * Ohne Wiederholung wird jeder kurze Aussetzer sofort zur 503 auf der Website: eine vom Backend geschlossene
 * Keep-alive-Verbindung („other side closed“), ein Neustart beim Deployment, ein Timeout unter Last oder ein 429.
 * Nur für lesende Abrufe (GET) gedacht.
 */

export interface RetryOptions {
	/** Wartezeiten vor dem 2., 3. … Versuch in ms (Länge = Anzahl Wiederholungen) */
	delays: number[];
	/** Obergrenze für `Retry-After` bei 429/503 in ms */
	maxRetryAfterMs?: number;
	sleep?: (ms: number) => Promise<void>;
	/** Meldung je fehlgeschlagenem Versuch (Log) */
	onRetry?: (info: { attempt: number; reason: string; waitMs: number }) => void;
}

/** Antworten, die sich typischerweise von selbst erledigen */
export function isTransientStatus(status: number): boolean {
	return status === 408 || status === 429 || status === 502 || status === 503 || status === 504;
}

/** `Retry-After` in ms (Sekunden oder HTTP-Datum), sonst `null` */
export function retryAfterMs(value: string | null, now: number = Date.now()): number | null {
	if (!value) return null;
	const seconds = Number(value);
	if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
	const date = Date.parse(value);
	return Number.isNaN(date) ? null : Math.max(0, date - now);
}

function describe(error: unknown): string {
	if (error instanceof Error) {
		const cause = (error as Error & { cause?: unknown }).cause;
		const detail = cause instanceof Error ? `: ${cause.message}` : '';
		return `${error.name} ${error.message}${detail}`;
	}
	return String(error);
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * `doFetch` aufrufen; bei Netzwerkfehler/Timeout oder vorübergehendem Status erneut versuchen.
 * Gibt die letzte Antwort zurück (auch eine fehlerhafte) bzw. wirft den letzten Netzwerkfehler.
 */
export async function fetchWithRetry(
	doFetch: () => Promise<Response>,
	options: RetryOptions
): Promise<Response> {
	const sleep = options.sleep ?? defaultSleep;
	const maxRetryAfter = options.maxRetryAfterMs ?? 2000;
	for (let attempt = 0; ; attempt++) {
		const retriesLeft = attempt < options.delays.length;
		let reason: string;
		let waitMs = options.delays[attempt] ?? 0;
		try {
			const res = await doFetch();
			if (!isTransientStatus(res.status) || !retriesLeft) return res;
			reason = `HTTP ${res.status}`;
			const after = retryAfterMs(res.headers.get('retry-after'));
			if (after !== null) waitMs = Math.min(Math.max(after, waitMs), maxRetryAfter);
			await res.body?.cancel().catch(() => {});
		} catch (error) {
			if (!retriesLeft) throw error;
			reason = describe(error);
		}
		options.onRetry?.({ attempt: attempt + 1, reason, waitMs });
		await sleep(waitMs);
	}
}
