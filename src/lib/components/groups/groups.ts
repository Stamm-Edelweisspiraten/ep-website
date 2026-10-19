/**
 * Hilfen für Gruppenseiten und -karten (Client-sicher, nur Typen aus `$lib/server`).
 */
import { groupImageUrl } from '$lib/images';
import type { GroupType, WebsiteGroup } from '$lib/server/types';

export const GROUP_TYPE_LABELS: Record<GroupType, string> = { meute: 'Meute', sippe: 'Sippe' };

export const GROUP_TYPE_LEADS: Record<GroupType, string> = {
	meute: 'Spielen, Basteln und kleine Abenteuer in der Gruppe erleben.',
	sippe: 'Zeltlager, Fahrten und echte Gemeinschaft mit Gleichaltrigen.'
};

/** Reihenfolge der Abschnitte: erst Meute, dann Sippen */
export const GROUP_TYPE_ORDER: readonly GroupType[] = ['meute', 'sippe'];

/**
 * Bilder der alten Website als Ersatz, solange im Intern-Bereich kein Gruppenbild hinterlegt ist.
 * Schlüssel = Slug der Gruppe.
 */
export const GROUP_FALLBACK_IMAGES: Readonly<Record<string, string>> = {
	'sportliche-panther': '/meute_panther.avif',
	funkelfuechse: '/sippe_funkel_fuechse.avif',
	'die-goldenen-loewenzaehne': '/die_goldenen_loewenzaehne.avif'
};

/** „A“, „A und B“, „A, B und C“; leere Namen werden ignoriert. */
export function joinNames(names: readonly string[]): string {
	const list = names.map((n) => n.trim()).filter(Boolean);
	if (list.length <= 1) return list[0] ?? '';
	return `${list.slice(0, -1).join(', ')} und ${list[list.length - 1]}`;
}

/** Vornamen der Leitung als Text, z. B. „Larissa und Fipsi“ */
export function leaderText(group: Pick<WebsiteGroup, 'leaders'>): string {
	return joinNames(group.leaders.map((l) => l.firstName));
}

/** Bild der Gruppe (Proxy) oder statisches Ersatzbild oder `null` */
export function groupImage(group: Pick<WebsiteGroup, 'slug' | 'imagePath'>): string | null {
	return groupImageUrl(group) ?? GROUP_FALLBACK_IMAGES[group.slug] ?? null;
}

export interface GroupSection {
	type: GroupType;
	label: string;
	groups: WebsiteGroup[];
}

/** Gruppen nach Typ (Meute, Sippe) – leere Abschnitte entfallen, Reihenfolge der Liste bleibt. */
export function groupSections(groups: readonly WebsiteGroup[]): GroupSection[] {
	return GROUP_TYPE_ORDER.map((type) => ({
		type,
		label: GROUP_TYPE_LABELS[type],
		groups: groups.filter((g) => g.type === type)
	})).filter((s) => s.groups.length > 0);
}
