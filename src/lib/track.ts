/**
 * Ereignisse an Umami (Besucherstatistik, selbst gehostet, ohne Cookies) – nur wenn das Skript geladen ist.
 *
 * Datenschutz-Regel für ALLE Ereignisse: nur WAS passiert (Klick, Ansicht, Filterart, Ergebnis), nie WAS jemand
 * eingibt (keine Namen, E-Mail-Adressen, Telefonnummern, Nachrichten, Suchbegriffe). Werte sind feste Bezeichner
 * oder Inhalte der Website selbst (Gruppen-Slug, Seitenpfad ohne Query, Ziel-Domain externer Links).
 */

type EventData = Record<string, string | number | boolean>;

interface UmamiApi {
	track: (name: string, data?: EventData) => void;
}

function api(): UmamiApi | null {
	if (typeof window === 'undefined') return null;
	const u = (window as unknown as { umami?: UmamiApi }).umami;
	return u && typeof u.track === 'function' ? u : null;
}

/** Ereignis senden; ohne Umami (nicht konfiguriert, blockiert, Widerspruch) passiert nichts. */
export function track(name: string, data?: EventData): void {
	try {
		const u = api();
		if (!u) return;
		const clean: EventData = {};
		for (const [k, v] of Object.entries(data ?? {})) {
			clean[k] = typeof v === 'string' ? v.slice(0, 200) : v;
		}
		u.track(name, Object.keys(clean).length ? clean : undefined);
	} catch {
		// Statistik darf nie die Seite stören
	}
}

/**
 * Wie `track`, wartet aber, bis das Umami-Skript da ist (es lädt mit `defer`). Für Ereignisse direkt beim
 * Seitenaufruf, z. B. „Formular gesendet“ auf der Erfolgsseite. Gibt nach ~5 s auf.
 */
export function trackWhenReady(name: string, data?: EventData): void {
	if (typeof window === 'undefined') return;
	let tries = 0;
	const attempt = () => {
		if (api()) return track(name, data);
		if (++tries < 25) setTimeout(attempt, 200);
	};
	attempt();
}

/** Seitenpfad ohne Query und Anker (Suchparameter können Eingaben enthalten) */
export function currentPath(): string {
	return typeof location === 'undefined' ? '' : location.pathname;
}

/** Namen der Felder mit Fehlern (nur Feldnamen, nie Inhalte), sortiert und kommagetrennt */
export function fieldNames(errors: Record<string, unknown> | null | undefined): string {
	return Object.keys(errors ?? {})
		.filter((k) => /^[a-zA-Z]{1,30}$/.test(k))
		.sort()
		.join(',');
}
