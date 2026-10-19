/** Hilfen für die Kontaktseite (Client-sicher). */

/** Initialen für Avatare ohne Bild: „Larissa Muster“ → „LM“, „Fipsi“ → „F“. */
export function initials(name: string): string {
	const parts = name
		.trim()
		.split(/[\s-]+/)
		.filter(Boolean);
	if (parts.length === 0) return '?';
	const first = parts[0]!;
	const last = parts.length > 1 ? parts[parts.length - 1]! : '';
	return (Array.from(first)[0]! + (last ? Array.from(last)[0]! : '')).toLocaleUpperCase('de-DE');
}

/** Jahr aus `YYYY-MM-DD` oder `null` */
export function sinceYear(since: string | null | undefined): string | null {
	const m = since ? /^(\d{4})-\d{2}-\d{2}$/.exec(since) : null;
	return m ? m[1]! : null;
}

/** Ab dieser Länge (oder Zeilenzahl) wird ein Text eingeklappt angezeigt */
export const LONG_TEXT_CHARS = 320;
export const LONG_TEXT_LINES = 5;

export function isLongText(text: string | null | undefined): boolean {
	if (!text) return false;
	return text.length > LONG_TEXT_CHARS || text.split('\n').length > LONG_TEXT_LINES;
}
