/**
 * Anbindung an das neue Backend (Intern-Bereich, Website-API) statt PocketBase.
 *
 * Alle Abrufe laufen serverseitig mit dem API-Key aus `WEBSITE_API_KEY` – der Key gelangt nie in den Browser.
 * Die Daten werden in die Form gebracht, die die Seiten von PocketBase kannten (`Appointment` mit
 * `date`, `end_date`, `pictures`, `tags`, `expand.tags`), damit sich an den Seiten möglichst wenig ändert.
 *
 * Umgebung:
 * - `WEBSITE_API_URL` – Basis-URL des Backends ohne abschließenden Schrägstrich (Standard `http://app:3000`)
 * - `WEBSITE_API_KEY` – API-Key mit den Scopes `events.website.read`, `galleries.website.read`, `members.website.read`
 */
import { env } from '$env/dynamic/private';

// --- Datenverträge des Backends (Auszug, siehe docs/api.md → „Stammeswebsite“) ----------------

interface BackendEvent {
	id: string;
	title: string;
	description: string | null;
	location: string | null;
	color: string | null;
	startsOn: string;
	startsTime: string | null;
	endsOn: string | null;
	endsTime: string | null;
	tags: string[];
	groups: string[];
	groupIds: string[];
	recurring: boolean;
	occurrenceDate: string | null;
}

interface BackendEventRef {
	id: string;
	title: string;
	startsOn: string;
	endsOn: string | null;
}

interface BackendGallery {
	id: string;
	title: string;
	description: string | null;
	imageCount: number;
	cover: { imageId: string } | null;
	events: BackendEventRef[];
	updatedAt: string;
}

interface BackendGalleryDetail extends BackendGallery {
	images: { id: string; description: string | null; position: number }[];
}

export interface BackendGroup {
	id: string;
	/** Website-Adresse `/<type>/<slug>` */
	slug: string;
	name: string;
	type: 'meute' | 'sippe';
	/** Website-Text, sonst die interne Beschreibung */
	description: string | null;
	/** Freitext, z. B. „7 bis 10 Jahre“ */
	ageRange: string | null;
	meetingPlace: string | null;
	/** 1 = Montag … 7 = Sonntag */
	meetingWeekday: number | null;
	meetingTime: string | null;
	meetingEndTime: string | null;
	color: string | null;
	contactEmail: string | null;
	leaders: { firstName: string }[];
	/** Relativer API-Pfad des Gruppenbilds oder `null` */
	imagePath: string | null;
}

// --- Form der Seiten (wie früher aus PocketBase) ----------------------------------------------

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

const cache = new Map<string, { value: unknown; expires: number }>();

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
	const hit = cache.get(key);
	if (hit && hit.expires > Date.now()) return hit.value as T;

	const res = await request(key, 'application/json');
	if (!res.ok) {
		// Bei Ausfall lieber den letzten Stand zeigen als einen Fehler
		if (hit && res.status !== 404) return hit.value as T;
		throw new BackendError(res.status, `Backend antwortet mit ${res.status} für ${path}`);
	}
	const body = (await res.json()) as { data: T };
	cache.set(key, { value: body.data, expires: Date.now() + TTL_MS });
	if (cache.size > 500) cache.delete(cache.keys().next().value as string);
	return body.data;
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

/** Halbjahres-Abschnitte (Serien füllen sonst das Limit von 200 je Abruf). */
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
	try {
		return toGroup(
			await getJson<BackendGroup>(`/api/v1/modules/members/website/groups/${encodeURIComponent(slug)}`)
		);
	} catch (e) {
		if (e instanceof BackendError && (e.status === 404 || e.status === 422)) return null;
		throw e;
	}
}

/** Gruppenbild aus dem Backend (für den Bild-Proxy); `null` bei 404. */
export async function fetchGroupImage(slug: string): Promise<Response | null> {
	const path = buildPath(`/api/v1/modules/members/website/groups/${encodeURIComponent(slug)}/image`);
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
	try {
		return await getJson<BackendGalleryDetail>(
			`/api/v1/modules/galleries/website/galleries/${encodeURIComponent(id)}`
		);
	} catch (e) {
		if (e instanceof BackendError && (e.status === 404 || e.status === 422)) return null;
		throw e;
	}
}

/** Bild-URLs je Termin-ID aus allen Galerien, die mit Terminen verknüpft sind. */
async function picturesByEvent(): Promise<Map<string, string[]>> {
	const map = new Map<string, string[]>();
	const galleries = (await listGalleries()).filter((g) => g.events.length > 0);
	const details = await Promise.all(galleries.map((g) => getGallery(g.id).catch(() => null)));
	for (const detail of details) {
		if (!detail) continue;
		const urls = [...detail.images]
			.sort((a, b) => a.position - b.position)
			.map((img) => imageUrl(detail.id, img.id, 'web'));
		for (const ref of detail.events) map.set(ref.id, [...(map.get(ref.id) ?? []), ...urls]);
	}
	return map;
}

// --- Termine -----------------------------------------------------------------------------------

function toAppointment(
	e: BackendEvent,
	groupColors: Map<string, string | null>,
	pictures: string[]
): Appointment {
	const tags: Tag[] = [
		...e.groups.map((name, i) => {
			const groupId = e.groupIds[i] ?? name;
			return { id: `g:${groupId}`, name, color: groupColors.get(groupId) ?? safeColor(e.color) };
		}),
		...e.tags.map((name) => ({ id: `t:${name}`, name, color: null }))
	];
	return {
		id: e.recurring && e.occurrenceDate ? `${e.id}~${e.occurrenceDate}` : e.id,
		title: e.title,
		description: e.description ?? '',
		date: localDateTime(e.startsOn, e.startsTime),
		end_date: e.endsOn ? localDateTime(e.endsOn, e.endsTime) : null,
		location: e.location,
		pictures,
		tags: tags.map((t) => t.id),
		expand: { tags }
	};
}

async function groupColorMap() {
	const groups = await listGroups();
	return new Map(groups.map((g) => [g.id, safeColor(g.color)]));
}

/** Alle Termine ab `FIRST_YEAR` bis Ende nächsten Jahres, aufsteigend nach Datum. */
export async function fetchAppointments(): Promise<Appointment[]> {
	const nextYear = Number(today().slice(0, 4)) + 1;
	const [colors, pictures, chunks] = await Promise.all([
		groupColorMap(),
		picturesByEvent().catch(() => new Map<string, string[]>()),
		Promise.all(
			halfYears(FIRST_YEAR, nextYear).map((r) =>
				getJson<BackendEvent[]>('/api/v1/modules/events/website/events', { ...r, limit: 200 })
			)
		)
	]);
	const seen = new Set<string>();
	const result: Appointment[] = [];
	for (const event of chunks.flat()) {
		const appointment = toAppointment(event, colors, pictures.get(event.id) ?? []);
		if (seen.has(appointment.id)) continue; // mehrtägige Termine stehen in zwei Abschnitten
		seen.add(appointment.id);
		result.push(appointment);
	}
	return result.sort((a, b) => a.date.localeCompare(b.date));
}

/** Ein Termin (`<id>` oder bei Serien `<id>~<YYYY-MM-DD>`); `null`, wenn unbekannt. */
export async function fetchAppointmentById(key: string): Promise<Appointment | null> {
	const [id, occurrence] = key.split('~');
	if (!id || (occurrence && !ISO_DATE.test(occurrence))) return null;
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
	const [colors, pictures] = await Promise.all([
		groupColorMap(),
		picturesByEvent().catch(() => new Map<string, string[]>())
	]);
	return toAppointment(event, colors, pictures.get(event.id) ?? []);
}

/** Alle Filter-Tags (Gruppen und Themen), die an Terminen vorkommen, nach Name. */
export function collectTags(appointments: Appointment[]): Tag[] {
	const map = new Map<string, Tag>();
	for (const a of appointments) for (const t of a.expand.tags) map.set(t.id, t);
	return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'de'));
}

/** Nächste Termine einer Gruppe (Slug wie auf der Website), höchstens `limit`. */
export async function fetchUpcomingForGroup(slug: string, limit = 3) {
	const groups = await listGroups();
	const group = groups.find((g) => g.slug === slug);
	if (!group) return { group: null, appointments: [] as Appointment[] };
	const [events, colors] = await Promise.all([
		getJson<BackendEvent[]>('/api/v1/modules/events/website/events', {
			from: today(),
			group: group.id,
			limit
		}),
		groupColorMap()
	]);
	return {
		group: { name: group.name, tagId: `g:${group.id}` },
		appointments: events.map((e) => toAppointment(e, colors, []))
	};
}

// --- Galerie (früher: Termine mit Bildern) -----------------------------------------------------

function galleryDate(gallery: BackendGallery) {
	const first = [...gallery.events].sort((a, b) => a.startsOn.localeCompare(b.startsOn))[0];
	return {
		date: first ? localDateTime(first.startsOn, null) : gallery.updatedAt,
		end_date: first?.endsOn ? localDateTime(first.endsOn, null) : null
	};
}

/** Alle öffentlichen Galerien als „Termine mit Bildern“; `pictures[0]` ist das Titelbild. */
export async function fetchGalleryAppointments(): Promise<Appointment[]> {
	const [galleries, appointments] = await Promise.all([
		listGalleries(),
		fetchAppointments().catch(() => [] as Appointment[])
	]);
	const tagsByEvent = new Map<string, Tag[]>();
	for (const a of appointments) {
		const eventId = a.id.split('~')[0]!;
		const known = tagsByEvent.get(eventId) ?? [];
		for (const t of a.expand.tags) if (!known.some((k) => k.id === t.id)) known.push(t);
		tagsByEvent.set(eventId, known);
	}
	return galleries
		.filter((g) => g.imageCount > 0 && g.cover)
		.map((g) => {
			const tags = g.events.flatMap((e) => tagsByEvent.get(e.id) ?? []);
			const unique = [...new Map(tags.map((t) => [t.id, t])).values()];
			return {
				id: g.id,
				title: g.title,
				description: g.description ?? '',
				...galleryDate(g),
				location: null,
				pictures: [imageUrl(g.id, g.cover!.imageId, 'thumb')],
				tags: unique.map((t) => t.id),
				expand: { tags: unique }
			};
		})
		.sort((a, b) => b.date.localeCompare(a.date));
}

/** Eine Galerie mit allen Bildern (`web`); `null`, wenn unbekannt. */
export async function fetchGalleryAppointment(id: string): Promise<Appointment | null> {
	const gallery = await getGallery(id);
	if (!gallery) return null;
	return {
		id: gallery.id,
		title: gallery.title,
		description: gallery.description ?? '',
		...galleryDate(gallery),
		location: null,
		pictures: [...gallery.images]
			.sort((a, b) => a.position - b.position)
			.map((img) => imageUrl(gallery.id, img.id, 'web')),
		tags: [],
		expand: { tags: [] }
	};
}
