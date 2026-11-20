/**
 * Besucherstatistik mit Umami (selbst gehostet, ohne Cookies).
 *
 * Der Browser spricht nur mit unserer Domain: `/stats/script.js` liefert das Tracker-Skript aus der Umami-Instanz,
 * `/stats/api/send` reicht Ereignisse serverseitig weiter. So bleibt die CSP bei `script-src 'self'`/`connect-src 'self'`
 * und Umami muss nicht öffentlich unter einer zweiten Adresse für Besucher*innen erreichbar sein.
 * Aus, solange `UMAMI_URL` oder `UMAMI_WEBSITE_ID` fehlen bzw. ungültig sind.
 */
import { env } from '$env/dynamic/private';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface UmamiConfig {
	/** Basis-URL der Umami-Instanz ohne abschließenden Schrägstrich */
	url: string;
	websiteId: string;
}

/** Rein: prüft Adresse (http/https) und Website-ID (UUID); sonst `null` = Statistik aus. */
export function parseUmamiConfig(url: string | undefined, websiteId: string | undefined): UmamiConfig | null {
	const u = (url ?? '').trim().replace(/\/+$/, '');
	const id = (websiteId ?? '').trim().toLowerCase();
	if (!UUID_RE.test(id)) return null;
	try {
		const parsed = new URL(u);
		if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
	} catch {
		return null;
	}
	return { url: u, websiteId: id };
}

export function umamiConfig(): UmamiConfig | null {
	return parseUmamiConfig(env.UMAMI_URL, env.UMAMI_WEBSITE_ID);
}

/** Höchstgröße eines Ereignisses (Umami schickt wenige hundert Bytes) */
export const MAX_EVENT_BYTES = 16_384;

/**
 * Rein: Nur Ereignisse für unsere eigene Website weiterreichen (kein offenes Relay in die Umami-Instanz).
 * Erwartet das Format des Trackers `{ type, payload: { website, … } }`.
 */
export function isOwnEvent(body: string, websiteId: string): boolean {
	if (!body || body.length > MAX_EVENT_BYTES) return false;
	try {
		const data = JSON.parse(body) as { type?: unknown; payload?: { website?: unknown } };
		return (
			(data.type === 'event' || data.type === 'identify') &&
			typeof data.payload?.website === 'string' &&
			data.payload.website.toLowerCase() === websiteId
		);
	} catch {
		return false;
	}
}
