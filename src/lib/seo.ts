/**
 * Suchmaschinen und Vorschauen: Hilfen für strukturierte Daten (JSON-LD, schema.org) und absolute Adressen.
 * Rein (ohne SvelteKit-Importe), im Browser und auf dem Server nutzbar – getestet in `tests/unit/website-seo.test.ts`.
 * Ausgabe über `components/Seo.svelte`.
 */

export const SITE_NAME = 'Stamm Edelweißpiraten';
export const SITE_LOCALE = 'de_DE';
/** Standard-Vorschaubild (JPEG, 1200 × 630 – AVIF verstehen viele Vorschau-Dienste nicht) */
export const DEFAULT_OG_IMAGE = '/og-default.jpg';
export const CONTACT_EMAIL = 'stafues@edelweisspiraten-bremen.de';
export const INSTAGRAM_URL = 'https://instagram.com/edelweisspiraten_cpd';

/** Treffpunkt der Gruppenstunden */
export const MEETING_PLACE = {
	name: 'Ev. Kirchengemeinde Bremen-Hastedt',
	streetAddress: 'Drakenburger Str. 42',
	postalCode: '28207',
	addressLocality: 'Bremen',
	addressCountry: 'DE'
} as const;

export type JsonLd = Record<string, unknown>;

/** Basis-URL ohne abschließenden Schrägstrich */
export function cleanBase(base: string): string {
	return base.trim().replace(/\/+$/, '');
}

/** Absolute Adresse; bereits absolute (`https://…`) bleiben unverändert */
export function absoluteUrl(base: string, path: string): string {
	if (/^https?:\/\//i.test(path)) return path;
	const p = path.startsWith('/') ? path : `/${path}`;
	return `${cleanBase(base)}${p}`;
}

/**
 * JSON für `<script type="application/ld+json">`: `<`, `>`, `&` und die Zeilentrenner U+2028/U+2029 als
 * Unicode-Escape – so kann kein Text aus dem Backend das Skript-Element beenden (`</script>`) oder HTML einschleusen.
 */
export function serializeJsonLd(data: unknown): string {
	return JSON.stringify(data)
		.replace(/</g, '\\u003c')
		.replace(/>/g, '\\u003e')
		.replace(/&/g, '\\u0026')
		.replace(/\u2028/g, '\\u2028')
		.replace(/\u2029/g, '\\u2029');
}

/** Fertiges `<script type="application/ld+json">`-Element (für `{@html}` im `<svelte:head>`) */
export function jsonLdScript(data: JsonLd | JsonLd[]): string {
	return `<script type="application/ld+json">${serializeJsonLd(data)}<` + '/script>';
}

function postalAddress() {
	return {
		'@type': 'PostalAddress',
		streetAddress: MEETING_PLACE.streetAddress,
		postalCode: MEETING_PLACE.postalCode,
		addressLocality: MEETING_PLACE.addressLocality,
		addressCountry: MEETING_PLACE.addressCountry
	};
}

/** Treffpunkt als `Place` */
export function meetingPlace(): JsonLd {
	return { '@type': 'Place', name: MEETING_PLACE.name, address: postalAddress() };
}

/** `@id` der Organisation (Verweis aus anderen Objekten) */
export function organizationId(base: string): string {
	return `${cleanBase(base)}/#organisation`;
}

/** Der Stamm als Organisation (Startseite, Verweis als Veranstalter/Herausgeber) */
export function organization(base: string): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		'@id': organizationId(base),
		name: SITE_NAME,
		alternateName: 'Edelweißpiraten Bremen',
		description:
			'Pfadfinderstamm der Christlichen Pfadfinderschaft Deutschlands e. V. (CPD) in Bremen-Hastedt: ' +
			'Gruppenstunden, Fahrten und Lager für Kinder und Jugendliche ab 6 Jahren.',
		url: `${cleanBase(base)}/`,
		logo: absoluteUrl(base, '/logo.avif'),
		email: CONTACT_EMAIL,
		address: postalAddress(),
		location: meetingPlace(),
		sameAs: [INSTAGRAM_URL],
		memberOf: { '@type': 'Organization', name: 'Christliche Pfadfinderschaft Deutschlands e. V.' }
	};
}

/** Die Website selbst (Startseite) */
export function website(base: string): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: SITE_NAME,
		url: `${cleanBase(base)}/`,
		inLanguage: 'de-DE',
		publisher: { '@id': organizationId(base) }
	};
}

/** Brotkrümel; `path` relativ zur Website */
export function breadcrumb(base: string, items: { name: string; path: string }[]): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: item.name,
			item: absoluteUrl(base, item.path)
		}))
	};
}

/** Versatz von Europe/Berlin an einem Kalendertag, z. B. `+02:00` (Rückfall `+01:00`) */
export function berlinOffset(day: string, time = '12:00'): string {
	const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
	const t = /^(\d{2}):(\d{2})/.exec(time);
	if (!m || !t) return '+01:00';
	const at = new Date(Date.UTC(+m[1]!, +m[2]! - 1, +m[3]!, +t[1]!, +t[2]!));
	try {
		const name = new Intl.DateTimeFormat('en-US', {
			timeZone: 'Europe/Berlin',
			timeZoneName: 'longOffset'
		})
			.formatToParts(at)
			.find((p) => p.type === 'timeZoneName')?.value;
		const off = /GMT([+-]\d{2}:\d{2})/.exec(name ?? '')?.[1];
		return off ?? '+01:00';
	} catch {
		return '+01:00';
	}
}

/** `YYYY-MM-DD` bzw. mit Uhrzeit `YYYY-MM-DDTHH:MM+02:00` (Europe/Berlin) */
export function scheduleDate(day: string, time: string | null | undefined): string {
	const t = time && /^\d{2}:\d{2}/.test(time) ? time.slice(0, 5) : null;
	return t ? `${day}T${t}:00${berlinOffset(day, t)}` : day;
}

/** Klartext aus (bereinigtem) HTML für Beschreibungen in strukturierten Daten */
export function plainText(html: string, max = 0): string {
	const text = html
		.replace(/<(br|\/p|\/li|\/h\d)\b[^>]*>/gi, ' ')
		.replace(/<[^>]*>/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#0?39;|&apos;/g, "'")
		.replace(/&amp;/g, '&')
		.replace(/\s+/g, ' ')
		.trim();
	return max > 0 && text.length > max ? `${text.slice(0, max - 1).trimEnd()} …` : text;
}

export interface EventLdInput {
	base: string;
	/** z. B. `/termine/<key>` */
	path: string;
	title: string;
	description?: string | null;
	startsOn: string;
	startsTime?: string | null;
	endsOn?: string | null;
	endsTime?: string | null;
	location?: string | null;
	image?: string | null;
}

/** Termin als `Event` (ohne Ort: Treffpunkt des Stamms) */
export function event(input: EventLdInput): JsonLd {
	const endDay = input.endsOn || (input.endsTime ? input.startsOn : null);
	const ld: JsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Event',
		name: input.title,
		url: absoluteUrl(input.base, input.path),
		startDate: scheduleDate(input.startsOn, input.startsTime),
		eventStatus: 'https://schema.org/EventScheduled',
		eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
		location: input.location?.trim()
			? { '@type': 'Place', name: input.location.trim(), address: input.location.trim() }
			: meetingPlace(),
		organizer: { '@type': 'Organization', name: SITE_NAME, url: `${cleanBase(input.base)}/` }
	};
	if (endDay) ld.endDate = scheduleDate(endDay, input.endsTime);
	const description = plainText(input.description ?? '', 500);
	if (description) ld.description = description;
	if (input.image) ld.image = [absoluteUrl(input.base, input.image)];
	return ld;
}

/** Häufige Fragen als `FAQPage` (Antworten als Klartext) */
export function faqPage(items: { question: string; answerHtml: string }[]): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: items
			.map((f) => ({ q: f.question.trim(), a: plainText(f.answerHtml) }))
			.filter((f) => f.q && f.a)
			.map((f) => ({
				'@type': 'Question',
				name: f.q,
				acceptedAnswer: { '@type': 'Answer', text: f.a }
			}))
	};
}

export interface BlogPostingInput {
	base: string;
	/** `/blog/<slug>` */
	path: string;
	title: string;
	description?: string | null;
	/** ISO-Zeitpunkt */
	publishedAt: string;
	updatedAt?: string | null;
	image?: string | null;
	/** nur Vorname bzw. eingetragene Anzeige */
	authorName?: string | null;
	tags?: string[];
}

/** Blogbeitrag als `BlogPosting` */
export function blogPosting(input: BlogPostingInput): JsonLd {
	const url = absoluteUrl(input.base, input.path);
	const ld: JsonLd = {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: input.title.slice(0, 110),
		url,
		mainEntityOfPage: { '@type': 'WebPage', '@id': url },
		datePublished: input.publishedAt,
		dateModified: input.updatedAt || input.publishedAt,
		inLanguage: 'de-DE',
		author: input.authorName?.trim()
			? { '@type': 'Person', name: input.authorName.trim() }
			: { '@type': 'Organization', name: SITE_NAME, url: `${cleanBase(input.base)}/` },
		publisher: {
			'@type': 'Organization',
			name: SITE_NAME,
			url: `${cleanBase(input.base)}/`,
			logo: { '@type': 'ImageObject', url: absoluteUrl(input.base, '/logo-sm.avif') }
		}
	};
	const description = plainText(input.description ?? '', 300);
	if (description) ld.description = description;
	if (input.image) ld.image = [absoluteUrl(input.base, input.image)];
	if (input.tags?.length) ld.keywords = input.tags.join(', ');
	return ld;
}
