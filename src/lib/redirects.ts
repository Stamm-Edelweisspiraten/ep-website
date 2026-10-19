/**
 * Weiterleitungen alter Adressen der früheren Website (308 – dauerhaft, Methode bleibt).
 * Die einzige Quelle der Zuordnung; die Routen unter `src/routes/{meute,sippe,download}` nutzen sie.
 */

/** Alte Gruppenseiten → Slug der Gruppe im Intern-Bereich (`/gruppen/<slug>`) */
export const LEGACY_GROUP_SLUGS: Readonly<Record<string, string>> = {
	'/meute': 'sportliche-panther',
	'/sippe/funkelfuechse': 'funkelfuechse',
	'/sippe/die-goldenen-loewenzaehne': 'die-goldenen-loewenzaehne'
};

/** Alte Seiten ohne Gruppenbezug → neues Ziel */
export const LEGACY_PAGES: Readonly<Record<string, string>> = {
	'/sippe': '/gruppen',
	// Downloads entfallen vorerst
	'/download': '/'
};

/** Ziel, wenn die Gruppe (noch) nicht auf der Website steht */
export const GROUPS_FALLBACK = '/gruppen';

/** `/Meute/` → `/meute`; Unterpfade von `/download` landen bei `/download`. */
export function normalizeLegacyPath(pathname: string): string {
	let path = pathname.toLowerCase().replace(/\/+$/, '');
	if (path === '') path = '/';
	if (path.startsWith('/download/')) path = '/download';
	return path;
}

/**
 * Ziel einer alten Adresse oder `null`, wenn sie nicht bekannt ist.
 * @param knownSlugs Slugs der Gruppen auf der Website; `null` = unbekannt (z. B. API-Fehler) →
 *   es wird trotzdem auf die Gruppenseite geleitet.
 */
export function legacyRedirectTarget(
	pathname: string,
	knownSlugs: readonly string[] | null
): string | null {
	const path = normalizeLegacyPath(pathname);
	const slug = LEGACY_GROUP_SLUGS[path];
	if (slug) {
		if (knownSlugs && !knownSlugs.includes(slug)) return GROUPS_FALLBACK;
		return `/gruppen/${slug}`;
	}
	return LEGACY_PAGES[path] ?? null;
}

/** `true`, wenn für die Adresse die Gruppenliste gebraucht wird. */
export function needsGroupLookup(pathname: string): boolean {
	return normalizeLegacyPath(pathname) in LEGACY_GROUP_SLUGS;
}
