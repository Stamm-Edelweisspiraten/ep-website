/** Hilfen für Kontakt- und Teamseite (Client-sicher, nur Typen aus `$lib/server`). */
import type { WebsiteOffice } from '$lib/server/types';

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

/** Ämter nach ihrer Reihenfolge im Intern-Bereich (`position`), ohne die Eingabe zu verändern */
export function sortOffices<T extends Pick<WebsiteOffice, 'position'>>(offices: readonly T[]): T[] {
	return [...offices].sort((a, b) => a.position - b.position);
}

/** Amt einer Person im Team */
export interface TeamOffice {
	id: string;
	name: string;
	/** `YYYY-MM-DD` oder `null` */
	since: string | null;
}

/** Eine Person im Team mit allen ihren Ämtern */
export interface TeamMember {
	id: string;
	name: string;
	bio: string | null;
	avatarPath: string | null;
	offices: TeamOffice[];
}

/**
 * Personen aus den Ämtern: jede Person **einmal**, mit allen Ämtern in Amts-Reihenfolge.
 * Die Beschreibung (`bio`) ist im Intern-Bereich ohnehin eine je Person; Reihenfolge der Personen =
 * erstes Auftreten (Amts-Reihenfolge, dann Reihenfolge der Inhaber*innen im Amt).
 */
export function teamMembers(offices: readonly WebsiteOffice[]): TeamMember[] {
	const byId = new Map<string, TeamMember>();
	for (const office of sortOffices(offices)) {
		for (const holder of office.holders) {
			let member = byId.get(holder.id);
			if (!member) {
				member = {
					id: holder.id,
					name: holder.name,
					bio: holder.bio,
					avatarPath: holder.avatarPath,
					offices: []
				};
				byId.set(holder.id, member);
			}
			member.bio ??= holder.bio;
			member.avatarPath ??= holder.avatarPath;
			if (!member.offices.some((o) => o.id === office.id)) {
				member.offices.push({ id: office.id, name: office.name, since: holder.since });
			}
		}
	}
	return [...byId.values()];
}

/** Ämter ohne Inhaber*innen (Reihenfolge wie im Intern-Bereich) */
export function vacantOffices(offices: readonly WebsiteOffice[]): WebsiteOffice[] {
	return sortOffices(offices).filter((o) => o.holders.length === 0);
}
