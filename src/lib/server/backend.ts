/**
 * Anbindung an das neue Backend (Intern-Bereich, Website-API) statt PocketBase.
 *
 * Alle Abrufe laufen serverseitig mit dem API-Key aus `WEBSITE_API_KEY` – der Key gelangt nie in den Browser.
 * Termine und Galerien werden in die Seitenform `SiteEvent`/`SiteGallery` (`../site-types.ts`) gebracht; nur die
 * Terminvorschau der Gruppenseite nutzt noch die alte PocketBase-Form `Appointment`.
 *
 * Umgebung:
 * - `WEBSITE_API_URL` – Basis-URL des Backends ohne abschließenden Schrägstrich (Standard `http://app:3000`)
 * - `WEBSITE_API_KEY` – API-Key mit den Scopes `events.website.read`, `galleries.website.read`, `members.website.read`
 */
import { env } from '$env/dynamic/private';
import type {
	BackendEvent,
	BackendEventPage,
	BackendGallery,
	BackendGalleryDetail,
	BackendGroup
} from './backend-types';
import { fetchEventWindows, type EventPageFetcher } from './event-pages';
import { EVENT_KEY_RE, UUID_RE, createCachedLoader } from './cache';

import type {
	SiteEvent,
	SiteGallery,
	SiteGalleryDetail,
	SiteGalleryRef,
	SiteGroupRef
} from '../site-types';

export type { BackendGroup } from './backend-types';

// --- Alte Form (PocketBase) für `AppointmentPreview` ------------------------------------------

export interface Tag {
	id: string;
	name: string;
	color: string | null;
}

export interface Appointment {
	/** Bei Serien `<id>~<YYYY-MM-DD>`, damit jedes Vorkommen eine eigene Adresse hat */
	id: string;
	title: string;
	description: string;
	/** Beginn als lokale Zeit `YYYY-MM-DDTHH:MM:00` (für `new Date(…)`) */
	date: string;
	end_date: string | null;
	location: string | null;
	/** Bild-URLs (über den Bild-Proxy der Website) */
	pictures: string[];
	/** IDs aus `expand.tags` */
	tags: string[];
	expand: { tags: Tag[] };
}

// --- HTTP ----------------------------------------------------------------------------------------

const TIMEOUT_MS = 5000;
const TTL_MS = 60_000;
/** Erstes Jahr, das auf der Terminseite angeboten wird */
export const FIRST_YEAR = 2023;

/** Nur Website-Endpunkte – der Key soll nichts anderes abrufen können. */
const ALLOWED_PATH = /^\/api\/v1\/modules\/[a-z0-9-]+\/website\/[A-Za-z0-9/_.%-]*$/;

/**
 * JSON-Cache (#20, `cache.ts`): Erfolge 60 s, 404/422 (unbekannte IDs) 60 s negativ, gleichzeitige Abrufe desselben
 * Pfads zusammengelegt, bei Ausfall letzter Stand (erneuter Versuch nach 5 s).
 */
const cache = createCachedLoader<unknown>({
	ttlMs: TTL_MS,
	negativeTtlMs: 60_000,
	errorTtlMs: 5_000,
	maxEntries: 1000,
	isNegative: (e) => e instanceof BackendError && (e.status === 404 || e.status === 422)
});

export class BackendError extends Error {
	constructor(
		readonly status: number,
		message: string
	) {
		super(message);
	}
}

function config() {
	const baseUrl = (env.WEBSITE_API_URL || 'http://app:3000').trim().replace(/\/+$/, '');
	const apiKey = (env.WEBSITE_API_KEY ?? '').trim();
	if (!apiKey) throw new BackendError(503, 'WEBSITE_API_KEY ist nicht gesetzt');
	return { baseUrl, apiKey };
}

function buildPath(path: string, query: Record<string, string | number | undefined> = {}) {
	if (!ALLOWED_PATH.test(path) || path.includes('..')) {
		throw new BackendError(400, `Unzulässiger API-Pfad: ${path}`);
	}
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) {
		if (value !== undefined && value !== '') params.set(key, String(value));
	}
	const qs = params.toString();
	return qs ? `${path}?${qs}` : path;
}

async function request(pathWithQuery: string, accept: string): Promise<Response> {
	const { baseUrl, apiKey } = config();
	return fetch(`${baseUrl}${pathWithQuery}`, {
		headers: { authorization: `Bearer ${apiKey}`, accept },
		signal: AbortSignal.timeout(TIMEOUT_MS)
	});
}

/** JSON-Endpunkt abrufen, `{ data }` entpacken, 60 s zwischenspeichern. */
async function getJson<T>(path: string, query?: Record<string, string | number | undefined>) {
	const key = buildPath(path, query);
	return cache.get(key, async () => {
		const res = await request(key, 'application/json');
		if (!res.ok) {
			throw new BackendError(res.status, `Backend antwortet mit ${res.status} für ${path}`);
		}
		const body = (await res.json()) as { data: T };
		return body.data;
	}) as Promise<T>;
}

/** Bild aus dem Backend holen (für den Bild-Proxy); `null` bei 404. */
export async function fetchImage(
	galleryId: string,
	imageId: string,
	variant: 'thumb' | 'web'
): Promise<Response | null> {
	const path = buildPath(
		`/api/v1/modules/galleries/website/galleries/${encodeURIComponent(galleryId)}/images/${encodeURIComponent(imageId)}/${variant}`
	);
	const res = await request(path, 'image/*');
	if (res.status === 404) return null;
	if (!res.ok) throw new BackendError(res.status, `Bild nicht abrufbar (${res.status})`);
	return res;
}

// --- Hilfen ------------------------------------------------------------------------------------

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function localDateTime(day: string, time: string | null) {
	return `${day}T${time && /^\d{2}:\d{2}$/.test(time) ? time : '00:00'}:00`;
}

function safeColor(value: string | null | undefined) {
	return value && /^#[0-9a-f]{6}$/i.test(value) ? value : null;
}

export function imageUrl(galleryId: string, imageId: string, variant: 'thumb' | 'web') {
	return `/bilder/galerie/${encodeURIComponent(galleryId)}/${encodeURIComponent(imageId)}/${variant}`;
}

function today() {
	return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(new Date());
}

/** Halbjahres-Abschnitte (parallel abrufbar, je Abschnitt mit Paging nachgeladen, siehe `event-pages.ts`). */
function halfYears(fromYear: number, toYear: number) {
	const ranges: { from: string; to: string }[] = [];
	for (let y = fromYear; y <= toYear; y++) {
		ranges.push({ from: `${y}-01-01`, to: `${y}-06-30` }, { from: `${y}-07-01`, to: `${y}-12-31` });
	}
	return ranges;
}

// --- Gruppen ----------------------------------------------------------------------------------

async function listGroups(): Promise<BackendGroup[]> {
	try {
		return await getJson<BackendGroup[]>('/api/v1/modules/members/website/groups');
	} catch {
		return []; // ohne Gruppen (bzw. Gruppenfarben) weitermachen
	}
}

/** Alte Gruppenbilder der Website, falls im Intern-Bereich (noch) kein Bild hinterlegt ist */
const STATIC_GROUP_IMAGES: Record<string, string> = {
	'sportliche-panther': '/meute_panther.avif',
	funkelfuechse: '/sippe_funkel_fuechse.avif',
	'die-goldenen-loewenzaehne': '/die_goldenen_loewenzaehne.avif'
};

const WEEKDAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const TYPE_LABELS = { meute: 'Meute', sippe: 'Sippe' } as const;

/** Gruppe in der Form, die die Seiten brauchen (alles schon formatiert). */
export interface Group {
	slug: string;
	name: string;
	type: 'meute' | 'sippe';
	/** „Meute“ / „Sippe“ */
	typeLabel: string;
	/** `/meute/<slug>` bzw. `/sippe/<slug>` */
	href: string;
	/** „Meute (7 bis 10 Jahre)“ */
	title: string;
	description: string;
	/** erster Satz der Beschreibung (Kacheln auf der Startseite) */
	teaser: string;
	ageRange: string;
	/** „Freitags“ */
	weekday: string;
	/** „16:30 Uhr - 18:00 Uhr“ */
	time: string;
	meetingPlace: string;
	/** „Larissa und Philipp“ */
	leaders: string;
	contactEmail: string | null;
	/** `#rrggbb`, Standard Wappenblau */
	color: string;
	image: string | null;
}

function joinNames(names: string[]) {
	if (names.length <= 1) return names.join('');
	return `${names.slice(0, -1).join(', ')} und ${names[names.length - 1]}`;
}

function teaserOf(text: string) {
	const first = text.split(/\n+/)[0]?.trim() ?? '';
	const sentence = /^(.{20,}?[.!?])(\s|$)/.exec(first)?.[1] ?? first;
	return sentence.length > 160 ? `${sentence.slice(0, 157).trimEnd()} …` : sentence;
}

function toGroup(g: BackendGroup): Group {
	const typeLabel = TYPE_LABELS[g.type] ?? 'Gruppe';
	const day = g.meetingWeekday ? WEEKDAYS[g.meetingWeekday - 1] : undefined;
	const time = g.meetingTime
		? g.meetingEndTime
			? `${g.meetingTime} Uhr - ${g.meetingEndTime} Uhr`
			: `${g.meetingTime} Uhr`
		: '';
	const description = g.description?.trim() ?? '';
	return {
		slug: g.slug,
		name: g.name,
		type: g.type,
		typeLabel,
		href: `/${g.type}/${g.slug}`,
		title: g.ageRange ? `${typeLabel} (${g.ageRange})` : typeLabel,
		description,
		teaser: teaserOf(description),
		ageRange: g.ageRange ?? '',
		weekday: day ? `${day}s` : '',
		time,
		meetingPlace: g.meetingPlace ?? '',
		leaders: joinNames(g.leaders.map((l) => l.firstName)),
		contactEmail: g.contactEmail,
		color: safeColor(g.color) ?? '#33338c',
		image: g.imagePath
			? `/bilder/gruppe/${encodeURIComponent(g.slug)}?v=${encodeURIComponent(
					new URLSearchParams(g.imagePath.split('?')[1] ?? '').get('v') ?? ''
				)}`
			: (STATIC_GROUP_IMAGES[g.slug] ?? null)
	};
}

/** Alle Gruppen, die im Intern-Bereich „auf der Website“ stehen (Meuten vor Sippen, dann nach Name). */
export async function fetchGroups(): Promise<Group[]> {
	return (await listGroups()).map(toGroup);
}

/** Eine Gruppe per Slug; `null`, wenn unbekannt oder nicht auf der Website. */
export async function fetchGroup(slug: string): Promise<Group | null> {
	if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;
	// unbekannte Slugs nicht beim Backend anfragen (Liste im Cache; ohne Liste direkt fragen)
	const listed = await listGroups();
	if (listed.length > 0 && !listed.some((g) => g.slug === slug)) return null;
	try {
		return toGroup(
			await getJson<BackendGroup>(
				`/api/v1/modules/members/website/groups/${encodeURIComponent(slug)}`
			)
		);
	} catch (e) {
		if (e instanceof BackendError && (e.status === 404 || e.status === 422)) return null;
		throw e;
	}
}

/** Gruppenbild aus dem Backend (für den Bild-Proxy); `null` bei 404. */
export async function fetchGroupImage(slug: string): Promise<Response | null> {
	const path = buildPath(
		`/api/v1/modules/members/website/groups/${encodeURIComponent(slug)}/image`
	);
	const res = await request(path, 'image/*');
	if (res.status === 404) return null;
	if (!res.ok) throw new BackendError(res.status, `Bild nicht abrufbar (${res.status})`);
	return res;
}

// --- Galerien ----------------------------------------------------------------------------------

async function listGalleries(): Promise<BackendGallery[]> {
	const all: BackendGallery[] = [];
	for (let offset = 0; offset < 1000; offset += 200) {
		const page = await getJson<{ items: BackendGallery[]; total: number }>(
			'/api/v1/modules/galleries/website/galleries',
			{ limit: 200, offset }
		);
		all.push(...page.items);
		if (all.length >= page.total || page.items.length === 0) break;
	}
	return all;
}

async function getGallery(id: string): Promise<BackendGalleryDetail | null> {
	if (!UUID_RE.test(id)) return null; // zufällige Adressen erreichen das Backend nicht
	if (!(await isListedGallery(id))) return null;
	try {
		return await getJson<BackendGalleryDetail>(
			`/api/v1/modules/galleries/website/galleries/${encodeURIComponent(id)}`
		);
	} catch (e) {
		if (e instanceof BackendError && (e.status === 404 || e.status === 422)) return null;
		throw e;
	}
}

// --- Termine -----------------------------------------------------------------------------------

type GroupRefInfo = { color: string | null; href: string | null };

/** Gruppen-Verweise (Farbe, Gruppenseite) je Gruppen-ID aus der Gruppenliste */
async function groupRefMap(): Promise<Map<string, GroupRefInfo>> {
	const groups = await listGroups();
	return new Map(
		groups.map((g) => [g.id, { color: safeColor(g.color), href: `/${g.type}/${g.slug}` }])
	);
}

/** Galerien je Termin-ID (öffentliche Galerien mit Bildern) */
async function galleriesByEvent(): Promise<Map<string, SiteGalleryRef[]>> {
	const map = new Map<string, SiteGalleryRef[]>();
	for (const g of await listGalleries()) {
		if (g.imageCount === 0) continue;
		const ref: SiteGalleryRef = {
			id: g.id,
			title: g.title,
			imageCount: g.imageCount,
			coverUrl: g.cover ? imageUrl(g.id, g.cover.imageId, 'thumb') : null
		};
		for (const e of g.events) map.set(e.id, [...(map.get(e.id) ?? []), ref]);
	}
	return map;
}

function eventKey(e: { id: string; recurring: boolean; occurrenceDate: string | null }) {
	return e.recurring && e.occurrenceDate ? `${e.id}~${e.occurrenceDate}` : e.id;
}

function toSiteEvent(
	e: BackendEvent,
	groups: Map<string, GroupRefInfo>,
	galleries: SiteGalleryRef[]
): SiteEvent {
	return {
		key: eventKey(e),
		id: e.id,
		title: e.title,
		description: e.description ?? '',
		location: e.location?.trim() || null,
		color: safeColor(e.color),
		startsOn: e.startsOn,
		startsTime: e.startsTime,
		endsOn: e.endsOn && e.endsOn > e.startsOn ? e.endsOn : null,
		endsTime: e.endsTime,
		recurring: e.recurring,
		occurrenceDate: e.occurrenceDate,
		groups: e.groups.map((name, i) => {
			const id = e.groupIds[i] ?? name;
			const ref = groups.get(id);
			return { id, name, color: ref?.color ?? null, href: ref?.href ?? null };
		}),
		tags: [...e.tags],
		galleries
	};
}

const eventPageFetcher: EventPageFetcher = (query) =>
	getJson<BackendEventPage | BackendEvent[]>('/api/v1/modules/events/website/events', {
		...query
	});

/** Rohdaten aller Termine ab `FIRST_YEAR` bis Ende nächsten Jahres. */
async function listEvents(): Promise<BackendEvent[]> {
	const nextYear = Number(today().slice(0, 4)) + 1;
	// mehrtägige Termine stehen in zwei Abschnitten – `fetchEventWindows` führt sie zusammen
	return fetchEventWindows(eventPageFetcher, halfYears(FIRST_YEAR, nextYear));
}

/** Alle Termine ab `FIRST_YEAR` bis Ende nächsten Jahres (Serien als einzelne Vorkommen), aufsteigend. */
export async function fetchEvents(): Promise<SiteEvent[]> {
	const [groups, galleries, events] = await Promise.all([
		groupRefMap(),
		galleriesByEvent().catch(() => new Map<string, SiteGalleryRef[]>()),
		listEvents()
	]);
	return events
		.map((e) => toSiteEvent(e, groups, galleries.get(e.id) ?? []))
		.sort(
			(a, b) =>
				a.startsOn.localeCompare(b.startsOn) ||
				(a.startsTime ?? '').localeCompare(b.startsTime ?? '') ||
				a.title.localeCompare(b.title, 'de')
		);
}

/** Ein Termin (`<id>` oder bei Serien `<id>~<YYYY-MM-DD>`); `null`, wenn unbekannt. */
export async function fetchEvent(key: string): Promise<SiteEvent | null> {
	if (!EVENT_KEY_RE.test(key)) return null; // zufällige Adressen erreichen das Backend nicht
	const [id, occurrence] = key.split('~');
	if (!id || (occurrence && !ISO_DATE.test(occurrence))) return null;
	if (!(await isListedEvent(id))) return null;
	let event: BackendEvent;
	try {
		event = await getJson<BackendEvent>(
			`/api/v1/modules/events/website/events/${encodeURIComponent(id)}`,
			{ occurrence }
		);
	} catch (e) {
		if (e instanceof BackendError && (e.status === 404 || e.status === 422)) return null;
		throw e;
	}
	const [groups, galleries] = await Promise.all([
		groupRefMap(),
		galleriesByEvent().catch(() => new Map<string, SiteGalleryRef[]>())
	]);
	return toSiteEvent(event, groups, galleries.get(event.id) ?? []);
}

// --- Termine der Gruppenseite (alte Form für `AppointmentPreview`) --------------------------------

function toAppointment(e: BackendEvent, groupColors: Map<string, string | null>): Appointment {
	const tags: Tag[] = [
		...e.groups.map((name, i) => {
			const groupId = e.groupIds[i] ?? name;
			return { id: `g:${groupId}`, name, color: groupColors.get(groupId) ?? safeColor(e.color) };
		}),
		...e.tags.map((name) => ({ id: `t:${name}`, name, color: null }))
	];
	return {
		id: eventKey(e),
		title: e.title,
		description: e.description ?? '',
		date: localDateTime(e.startsOn, e.startsTime),
		end_date: e.endsOn ? localDateTime(e.endsOn, e.endsTime) : null,
		location: e.location,
		pictures: [],
		tags: tags.map((t) => t.id),
		expand: { tags }
	};
}

/** Nächste Termine einer Gruppe (Slug wie auf der Website), höchstens `limit`. */
export async function fetchUpcomingForGroup(slug: string, limit = 3) {
	const groups = await listGroups();
	const group = groups.find((g) => g.slug === slug);
	if (!group) return { group: null, appointments: [] as Appointment[] };
	const events = await getJson<BackendEvent[]>('/api/v1/modules/events/website/events', {
		from: today(),
		group: group.id,
		limit
	});
	const colors = new Map(groups.map((g) => [g.id, safeColor(g.color)]));
	return {
		group: { name: group.name, tagId: `g:${group.id}` },
		appointments: events.map((e) => toAppointment(e, colors))
	};
}

// --- Galerien (Seiten) ---------------------------------------------------------------------------

function galleryDates(gallery: BackendGallery) {
	const first = [...gallery.events].sort((a, b) => a.startsOn.localeCompare(b.startsOn))[0];
	return {
		date: first?.startsOn ?? gallery.updatedAt.slice(0, 10),
		endDate: first?.endsOn && first.endsOn > first.startsOn ? first.endsOn : null
	};
}

/** Gruppen der verknüpften Termine je Termin-ID (Galerie-Filter) */
async function groupsByEvent(): Promise<Map<string, SiteGroupRef[]>> {
	const [events, refs] = await Promise.all([
		listEvents().catch(() => [] as BackendEvent[]),
		groupRefMap()
	]);
	const map = new Map<string, SiteGroupRef[]>();
	for (const e of events) {
		const known = map.get(e.id) ?? [];
		e.groups.forEach((name, i) => {
			const id = e.groupIds[i] ?? name;
			if (known.some((k) => k.id === id)) return;
			const ref = refs.get(id);
			known.push({ id, name, color: ref?.color ?? null, href: ref?.href ?? null });
		});
		map.set(e.id, known);
	}
	return map;
}

function toSiteGallery(g: BackendGallery, groups: Map<string, SiteGroupRef[]>): SiteGallery {
	const all = g.events.flatMap((e) => groups.get(e.id) ?? []);
	return {
		id: g.id,
		title: g.title,
		description: g.description ?? '',
		imageCount: g.imageCount,
		cover: g.cover
			? {
					url: imageUrl(g.id, g.cover.imageId, 'thumb'),
					width: g.cover.width,
					height: g.cover.height
				}
			: null,
		...galleryDates(g),
		events: [...g.events]
			.sort((a, b) => a.startsOn.localeCompare(b.startsOn))
			.map((e) => ({ key: e.id, title: e.title, startsOn: e.startsOn, endsOn: e.endsOn })),
		groups: [...new Map(all.map((x) => [x.id, x])).values()]
	};
}

/** Alle öffentlichen Galerien mit Bildern, neueste zuerst. */
export async function fetchGalleries(): Promise<SiteGallery[]> {
	const [galleries, groups] = await Promise.all([listGalleries(), groupsByEvent()]);
	return galleries
		.filter((g) => g.imageCount > 0)
		.map((g) => toSiteGallery(g, groups))
		.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, 'de'));
}

/** Eine Galerie mit allen Bildern; `null`, wenn unbekannt. */
export async function fetchGallery(id: string): Promise<SiteGalleryDetail | null> {
	const gallery = await getGallery(id);
	if (!gallery) return null;
	const groups = await groupsByEvent();
	return {
		...toSiteGallery(gallery, groups),
		images: [...gallery.images]
			.sort((a, b) => a.position - b.position)
			.map((img) => ({
				id: img.id,
				thumbUrl: imageUrl(gallery.id, img.id, 'thumb'),
				webUrl: imageUrl(gallery.id, img.id, 'web'),
				width: img.width,
				height: img.height,
				description: img.description?.trim() || null
			}))
	};
}

// --- Vorab-Prüfung unbekannter IDs (#20) ---------------------------------------------------------
// Unbekannte Termin-, Galerie- und Bild-IDs werden gegen die (zwischengespeicherten) Listen geprüft, damit
// tausend zufällige Adressen nicht tausend Backend-Abrufe auslösen. Ist die Liste gerade nicht abrufbar,
// wird wie bisher direkt gefragt (negativer Cache und Rate-Limit je IP greifen trotzdem).

async function isListedGallery(id: string): Promise<boolean> {
	const galleries = await listGalleries().catch(() => null);
	return !galleries || galleries.some((g) => g.id === id);
}

/** Nur Termine im Bereich der Terminseite (`FIRST_YEAR` bis Ende nächsten Jahres) sind über `/termine/<id>` erreichbar. */
async function isListedEvent(id: string): Promise<boolean> {
	const events = await listEvents().catch(() => null);
	return !events || events.some((e) => e.id === id);
}

/** Gehört das Bild zu einer öffentlichen Galerie? (für den Bild-Proxy; im Zweifel `true`) */
export async function isKnownGalleryImage(galleryId: string, imageId: string): Promise<boolean> {
	if (!UUID_RE.test(galleryId) || !UUID_RE.test(imageId)) return false;
	try {
		const gallery = await getGallery(galleryId);
		return !!gallery && gallery.images.some((img) => img.id === imageId);
	} catch {
		return true;
	}
}
