/**
 * Anbindung an das neue Backend (Intern-Bereich, Website-API) statt PocketBase.
 *
 * Alle Abrufe laufen serverseitig mit dem API-Key aus `WEBSITE_API_KEY` – der Key gelangt nie in den Browser.
 * Termine und Galerien werden in die Seitenform `SiteEvent`/`SiteGallery` (`../site-types.ts`) gebracht.
 *
 * Umgebung:
 * - `WEBSITE_API_URL` – Basis-URL des Backends ohne abschließenden Schrägstrich (Standard `http://app:3000`)
 * - `WEBSITE_API_KEY` – API-Key mit den Scopes `events.website.read`, `galleries.website.read`, `members.website.read`,
 *   `offices.website.read` („Unser Team“), `website.content.read` (Banner, häufige Fragen, Blog),
 *   `messages.website.contact` (Kontaktformular → Posteingang)
 */
import { env } from '$env/dynamic/private';
import type {
	BackendEvent,
	BackendEventPage,
	BackendGallery,
	BackendGalleryDetail,
	BackendGroup,
	BackendOffice,
	BackendBanner,
	BackendFaq,
	BackendPost,
	BackendPostImage,
	BackendPostPage,
	BackendPostSummary
} from './backend-types';
import { fetchEventWindows, type EventPageFetcher } from './event-pages';
import { EVENT_KEY_RE, UUID_RE, createCachedLoader } from './cache';
import { fetchWithRetry } from './retry';

import type {
	SiteEvent,
	SiteGallery,
	SiteGalleryDetail,
	SiteGalleryRef,
	SiteGroupRef,
	SiteOffice,
	SiteBanner,
	SiteFaq,
	SitePost,
	SitePostImage,
	SitePostPage,
	SitePostSummary
} from '../site-types';
import { renderRichText } from './rich-text';
import { todayBerlin } from '../dates';

export type { BackendGroup } from './backend-types';

// --- HTTP ----------------------------------------------------------------------------------------

/** Je Versuch; mit zwei Wiederholungen höchstens ~13 s */
const TIMEOUT_MS = 4000;
/** Wartezeiten vor der 2. und 3. Anfrage (kurze Aussetzer, Neustart beim Deployment) */
const RETRY_DELAYS_MS = [300, 1000];
const TTL_MS = 60_000;
/** Erstes Jahr, das auf der Terminseite angeboten wird */
export const FIRST_YEAR = 2023;

/** Nur Website-Endpunkte – der Key soll nichts anderes abrufen können. */
const ALLOWED_PATH = /^\/api\/v1\/modules\/[a-z0-9-]+\/website\/[A-Za-z0-9/_.%-]*$/;

/**
 * JSON-Cache (#20, `cache.ts`): Erfolge 60 s, 404/422 (unbekannte IDs) 60 s negativ, gleichzeitige Abrufe desselben
 * Pfads zusammengelegt, bei Ausfall letzter Stand (erneuter Versuch nach 2 s). Vorübergehende Fehler werden vorher
 * schon in `request` wiederholt (`retry.ts`).
 */
const cache = createCachedLoader<unknown>({
	ttlMs: TTL_MS,
	negativeTtlMs: 60_000,
	errorTtlMs: 2_000,
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

/** Anführungszeichen um den Wert entfernen (passiert leicht beim Eintragen in Dokploy/Compose) */
export function cleanEnvValue(value: string | undefined): string {
	return (value ?? '').trim().replace(/^(['"])(.*)\1$/, '$2').trim();
}

/** Präfix wie in Administration → API-Keys (`epk_` + 8 Zeichen) – zum Zuordnen im Log, nie der ganze Key */
export function keyPrefix(apiKey: string): string {
	return apiKey.slice(0, 12);
}

let formatWarned = false;

function config() {
	const baseUrl = cleanEnvValue(env.WEBSITE_API_URL || 'http://app:3000').replace(/\/+$/, '');
	const apiKey = cleanEnvValue(env.WEBSITE_API_KEY);
	if (!apiKey) throw new BackendError(503, 'WEBSITE_API_KEY ist nicht gesetzt');
	if (!apiKey.startsWith('epk_') && !formatWarned) {
		formatWarned = true;
		console.error('[backend] WEBSITE_API_KEY hat nicht das Format „epk_…“ – Key aus Administration → API-Keys eintragen');
	}
	return { baseUrl, apiKey };
}

/** 401/403 je Status nur einmal je Minute ausführlich erklären (sonst flutet jede Seite das Log) */
const authHintAt = new Map<number, number>();

function logAuthProblem(status: number, path: string, message: string) {
	const now = Date.now();
	if ((authHintAt.get(status) ?? 0) > now - 60_000) return;
	authHintAt.set(status, now);
	const prefix = keyPrefix(cleanEnvValue(env.WEBSITE_API_KEY));
	const hint =
		status === 401
			? `API-Key ${prefix}… wird nicht akzeptiert (unbekannt, widerrufen, abgelaufen oder Konto deaktiviert). ` +
				'In Administration → API-Keys prüfen bzw. neuen Key anlegen und WEBSITE_API_KEY im Website-Dienst ersetzen.'
			: `API-Key ${prefix}… fehlt ein Recht für ${path}. Benötigte Scopes: events.website.read ` +
				'galleries.website.read members.website.read offices.website.read website.content.read ' +
				'messages.website.contact ' +
				'(und das Konto muss sie selbst haben).';
	console.error(`[backend] ${hint}${message ? ` Backend: „${message}“` : ''}`);
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

/** Pfad ohne Query (Logs enthalten keine Suchbegriffe o. Ä.) */
function logPath(pathWithQuery: string) {
	return pathWithQuery.split('?')[0];
}

async function request(pathWithQuery: string, accept: string): Promise<Response> {
	const { baseUrl, apiKey } = config();
	return fetchWithRetry(
		() =>
			fetch(`${baseUrl}${pathWithQuery}`, {
				headers: { authorization: `Bearer ${apiKey}`, accept },
				signal: AbortSignal.timeout(TIMEOUT_MS)
			}),
		{
			delays: RETRY_DELAYS_MS,
			onRetry: ({ attempt, reason, waitMs }) =>
				console.warn(
					`[backend] ${logPath(pathWithQuery)}: ${reason} – Versuch ${attempt + 1} in ${waitMs} ms`
				)
		}
	);
}

/** JSON-Endpunkt abrufen, `{ data }` entpacken, 60 s zwischenspeichern. */
async function getJson<T>(path: string, query?: Record<string, string | number | undefined>) {
	const key = buildPath(path, query);
	return cache.get(key, async () => {
		let res: Response;
		try {
			res = await request(key, 'application/json');
		} catch (e) {
			console.error(`[backend] ${path}: nicht erreichbar`, e instanceof Error ? e.message : e);
			throw new BackendError(503, `Backend nicht erreichbar für ${path}`);
		}
		if (!res.ok) {
			if (res.status === 401 || res.status === 403) {
				const body = (await res.json().catch(() => null)) as {
					error?: { message?: string };
				} | null;
				logAuthProblem(res.status, path, body?.error?.message ?? '');
			} else if (res.status !== 404 && res.status !== 422) {
				console.error(`[backend] ${path}: HTTP ${res.status}`);
			}
			throw new BackendError(res.status, `Backend antwortet mit ${res.status} für ${path}`);
		}
		const body = (await res.json()) as { data: T };
		return body.data;
	}) as Promise<T>;
}

// --- Kontaktformular (Posteingang im Intern-Bereich) ---------------------------------------------

const CONTACT_BASE = '/api/v1/modules/messages/website/contact';

/** Spam-Schutz-Aufgabe (Proof-of-Work) vom Backend – nie zwischengespeichert, jede Aufgabe gilt nur einmal */
export interface ContactChallenge {
	algorithm: 'SHA-256';
	salt: string;
	challenge: string;
	maxNumber: number;
	signature: string;
	expiresAt: string;
}

export interface ContactSubmission {
	name: string;
	email: string;
	phone: string;
	message: string;
	pow: { salt: string; challenge: string; number: number; signature: string };
}

export async function fetchContactChallenge(): Promise<ContactChallenge> {
	const path = buildPath(`${CONTACT_BASE}/challenge`);
	let res: Response;
	try {
		res = await request(path, 'application/json');
	} catch (e) {
		console.error(`[backend] ${path}: nicht erreichbar`, e instanceof Error ? e.message : e);
		throw new BackendError(503, 'Backend nicht erreichbar');
	}
	if (!res.ok) {
		if (res.status === 401 || res.status === 403) logAuthProblem(res.status, path, '');
		else console.error(`[backend] ${path}: HTTP ${res.status}`);
		throw new BackendError(res.status, `Backend antwortet mit ${res.status}`);
	}
	return ((await res.json()) as { data: ContactChallenge }).data;
}

/**
 * Anfrage in den Posteingang legen. Wiederholungen bei Aussetzern sind unbedenklich: dieselbe Aufgabe kann das
 * Backend nur einmal einlösen, eine zweite Zustellung beantwortet es mit 409 (= schon angekommen).
 * Wirft `BackendError` (422 = Spam-Schutz/Eingaben abgelehnt, Text in `message`).
 */
export async function submitContact(input: ContactSubmission): Promise<void> {
	const { baseUrl, apiKey } = config();
	const path = buildPath(CONTACT_BASE);
	let res: Response;
	try {
		res = await fetchWithRetry(
			() =>
				fetch(`${baseUrl}${path}`, {
					method: 'POST',
					headers: {
						authorization: `Bearer ${apiKey}`,
						accept: 'application/json',
						'content-type': 'application/json'
					},
					body: JSON.stringify(input),
					signal: AbortSignal.timeout(TIMEOUT_MS * 2)
				}),
			{
				delays: RETRY_DELAYS_MS,
				onRetry: ({ attempt, reason, waitMs }) =>
					console.warn(`[backend] ${path}: ${reason} – Versuch ${attempt + 1} in ${waitMs} ms`)
			}
		);
	} catch (e) {
		console.error(`[backend] ${path}: nicht erreichbar`, e instanceof Error ? e.message : e);
		throw new BackendError(503, 'Backend nicht erreichbar');
	}
	if (res.ok || res.status === 409) return;
	const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
	const message = body?.error?.message ?? '';
	if (res.status === 401 || res.status === 403) logAuthProblem(res.status, path, message);
	else if (res.status !== 422) console.error(`[backend] ${path}: HTTP ${res.status}`);
	throw new BackendError(res.status, message || `Backend antwortet mit ${res.status}`);
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
	/** „16:30–18:00 Uhr“ */
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
			? `${g.meetingTime}–${g.meetingEndTime} Uhr`
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

// --- Nächste Termine (Startseite, Gruppenseite) --------------------------------------------------

/** So weit schauen „Nächste Termine“ höchstens voraus */
const UPCOMING_DAYS = 180;

function addDays(day: string, days: number) {
	const [y, m, d] = day.split('-').map(Number);
	return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/**
 * Nächste einzelne Termine ab heute, höchstens `limit` – ein kleiner Abruf statt der ganzen Terminliste.
 * Serien (z. B. die wöchentlichen Gruppenstunden) bleiben weg, die stehen schon bei den Gruppen.
 * Mit `groupSlug` nur Termine dieser Gruppe; eine unbekannte Gruppe ergibt eine leere Liste ohne Backend-Abruf.
 */
export async function fetchUpcomingEvents(
	opts: { limit?: number; groupSlug?: string } = {}
): Promise<SiteEvent[]> {
	const limit = opts.limit ?? 4;
	const groups = await listGroups();
	let groupId: string | undefined;
	if (opts.groupSlug) {
		groupId = groups.find((g) => g.slug === opts.groupSlug)?.id;
		if (!groupId) return [];
	}
	const from = today();
	const events = await getJson<BackendEvent[]>('/api/v1/modules/events/website/events', {
		from,
		to: addDays(from, UPCOMING_DAYS),
		group: groupId,
		limit: 100
	});
	const refs = await groupRefMap();
	return events
		.filter((e) => !e.recurring && (e.endsOn ?? e.startsOn) >= from)
		.sort(
			(a, b) =>
				a.startsOn.localeCompare(b.startsOn) ||
				(a.startsTime ?? '').localeCompare(b.startsTime ?? '')
		)
		.slice(0, limit)
		.map((e) => toSiteEvent(e, refs, []));
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

// --- Ämter („Unser Team“) ------------------------------------------------------------------------

/** IDs der Inhaber*innen: Better-Auth-IDs bzw. UUIDs */
const HOLDER_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

async function listOffices(): Promise<BackendOffice[]> {
	return getJson<BackendOffice[]>('/api/v1/modules/offices/website/offices');
}

/** Version aus dem `avatarPath` des Backends (`…/avatar?v=…`) – neues Bild → neue Adresse */
function avatarVersion(path: string) {
	return new URLSearchParams(path.split('?')[1] ?? '').get('v') ?? '';
}

/**
 * Ämter mit Inhaber*innen (nur Vornamen, nur mit Zustimmung im Profil), in der Reihenfolge des Intern-Bereichs.
 * Ämter ohne sichtbare Personen und ohne Adresse bleiben weg (nichts zu zeigen).
 */
export async function fetchTeam(): Promise<SiteOffice[]> {
	const offices = await listOffices();
	return [...offices]
		.sort((a, b) => a.position - b.position)
		.filter((o) => o.holders.length > 0 || o.emails.length > 0)
		.map((o) => ({
			id: o.id,
			name: o.name,
			description: o.description?.trim() || null,
			emails: o.emails,
			holders: o.holders.map((h) => ({
				id: h.id,
				firstName: h.firstName,
				bio: h.bio?.trim() || null,
				since: h.since,
				imageUrl: h.avatarPath
					? `/bilder/team/${encodeURIComponent(h.id)}?v=${encodeURIComponent(avatarVersion(h.avatarPath))}`
					: null
			}))
		}));
}

/** Aktuelle Bildversion einer Person mit Profilbild; `null`, wenn sie nicht (mit Bild) im Team steht. */
export async function teamAvatarVersion(userId: string): Promise<string | null> {
	if (!HOLDER_ID_RE.test(userId)) return null;
	const offices = await listOffices();
	for (const o of offices) {
		const h = o.holders.find((x) => x.id === userId);
		if (h?.avatarPath) return avatarVersion(h.avatarPath);
	}
	return null;
}

/** Profilbild einer Inhaberin / eines Inhabers aus dem Backend (für den Bild-Proxy); `null` bei 404. */
export async function fetchTeamAvatar(userId: string): Promise<Response | null> {
	if (!HOLDER_ID_RE.test(userId)) return null;
	const path = buildPath(
		`/api/v1/modules/offices/website/offices/holders/${encodeURIComponent(userId)}/avatar`
	);
	const res = await request(path, 'image/*');
	if (res.status === 404) return null;
	if (!res.ok) throw new BackendError(res.status, `Bild nicht abrufbar (${res.status})`);
	return res;
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

// --- Inhalte der Website: Banner, häufige Fragen, Blog (Modul `website`) ----------------------------

const CONTENT = '/api/v1/modules/website/website';
/** Beiträge je Seite auf `/blog` */
export const POSTS_PER_PAGE = 12;
/** Adresse eines Beitrags (wie `SLUG_PATTERN` im Backend) */
export const POST_SLUG_RE = /^(?=.{1,80}$)[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SAFE_LINK_RE = /^(\/(?!\/)[^\s]*|https?:\/\/[^\s]+|mailto:[^\s]+)$/i;
const MAX_TAG_LENGTH = 40;

/** Banner/Hinweise, die gerade laufen (in der Reihenfolge des Intern-Bereichs). */
export async function fetchBanners(): Promise<SiteBanner[]> {
	const banners = await getJson<BackendBanner[]>(`${CONTENT}/banners`);
	return banners.map((b) => {
		const linkUrl = b.linkUrl && SAFE_LINK_RE.test(b.linkUrl) ? b.linkUrl : null;
		return {
			id: b.id,
			title: b.title?.trim() || null,
			text: b.text,
			level: b.level === 'important' ? 'important' : 'info',
			placement: b.placement === 'home' ? 'home' : 'bar',
			linkUrl,
			linkLabel: linkUrl ? b.linkLabel?.trim() || null : null,
			linkExternal: !!linkUrl && /^https?:\/\//i.test(linkUrl),
			dismissible: b.dismissible,
			dismissKey: `${b.id}:${b.updatedAt}`
		};
	});
}

/** Aktive häufige Fragen (Antworten serverseitig bereinigt). */
export async function fetchFaqs(): Promise<SiteFaq[]> {
	const faqs = await getJson<BackendFaq[]>(`${CONTENT}/faqs`);
	return faqs.map((f) => ({
		id: f.id,
		question: f.question,
		answerHtml: renderRichText(f.answerHtml),
		featured: f.featured
	}));
}

export function postImageUrl(slug: string, imageId: string, variant: 'thumb' | 'web') {
	return `/bilder/blog/${encodeURIComponent(slug)}/${encodeURIComponent(imageId)}/${variant}`;
}

function postImage(slug: string, img: BackendPostImage, variant: 'thumb' | 'web'): SitePostImage {
	return {
		url: postImageUrl(slug, img.id, variant),
		width: img.width,
		height: img.height,
		alt: img.alt?.trim() ?? ''
	};
}

function toSitePostSummary(p: BackendPostSummary): SitePostSummary {
	const at = new Date(p.publishedAt);
	return {
		slug: p.slug,
		href: `/blog/${p.slug}`,
		title: p.title,
		teaser: p.teaser?.trim() || null,
		publishedOn: Number.isNaN(at.getTime()) ? p.publishedAt.slice(0, 10) : todayBerlin(at),
		publishedAt: p.publishedAt,
		cover: p.cover ? postImage(p.slug, p.cover, 'thumb') : null,
		tags: [...p.tags],
		authorName: p.authorName?.trim() || null
	};
}

/**
 * Veröffentlichte Beiträge, neueste zuerst (`page` ab 1, `POSTS_PER_PAGE` je Seite), optional nur ein Thema.
 * Ist das Modul im Intern-Bereich nicht aktiv (404), gibt es einfach keine Beiträge.
 */
export async function fetchPosts(
	opts: { tag?: string | null; page?: number; limit?: number } = {}
): Promise<SitePostPage> {
	const limit = Math.min(Math.max(1, Math.floor(opts.limit ?? POSTS_PER_PAGE)), 100);
	const page = Math.max(1, Math.floor(Number(opts.page) || 1));
	const tag = opts.tag?.trim().slice(0, MAX_TAG_LENGTH) || undefined;
	let data: BackendPostPage;
	try {
		data = await getJson<BackendPostPage>(`${CONTENT}/posts`, {
			limit,
			offset: (page - 1) * limit,
			tag
		});
	} catch (e) {
		if (e instanceof BackendError && e.status === 404) {
			return { items: [], total: 0, tags: [], page: 1, pages: 1 };
		}
		throw e;
	}
	return {
		items: data.items.map(toSitePostSummary),
		total: data.total,
		tags: data.tags.map((t) => ({ tag: t.tag, count: t.count })),
		page,
		pages: Math.max(1, Math.ceil(data.total / limit))
	};
}

/** Rohdaten eines Beitrags; `null`, wenn unbekannt (404/422 werden 60 s gemerkt). */
async function getPost(slug: string): Promise<BackendPost | null> {
	if (!POST_SLUG_RE.test(slug)) return null; // zufällige Adressen erreichen das Backend nicht
	try {
		return await getJson<BackendPost>(`${CONTENT}/posts/${encodeURIComponent(slug)}`);
	} catch (e) {
		if (e instanceof BackendError && (e.status === 404 || e.status === 422)) return null;
		throw e;
	}
}

/** Nächstes Vorkommen eines Termins ab heute (bei Serien), sonst das erste */
function eventLink(events: BackendEvent[], id: string): SitePost['event'] {
	const matches = events.filter((e) => e.id === id);
	if (!matches.length) return null;
	const day = today();
	const pick =
		matches.find((e) => (e.endsOn ?? e.startsOn) >= day) ?? matches[matches.length - 1]!;
	return { key: eventKey(pick), title: pick.title, startsOn: pick.startsOn };
}

/**
 * Ein veröffentlichter Beitrag mit bereinigtem Text; `null`, wenn unbekannt. Verknüpfungen erscheinen nur, wenn
 * Gruppe/Termin/Galerie auf der Website selbst öffentlich gelistet sind (sonst still weggelassen).
 */
export async function fetchPost(slug: string): Promise<SitePost | null> {
	const post = await getPost(slug);
	if (!post) return null;
	const images = new Map(post.images.map((i) => [i.id.toLowerCase(), i]));
	const [groups, events, galleries] = await Promise.all([
		post.groupIds.length ? listGroups() : Promise.resolve([] as BackendGroup[]),
		post.eventId ? listEvents().catch(() => [] as BackendEvent[]) : Promise.resolve([]),
		post.galleryId ? listGalleries().catch(() => [] as BackendGallery[]) : Promise.resolve([])
	]);
	const gallery = post.galleryId
		? galleries.find((g) => g.id === post.galleryId && g.imageCount > 0)
		: undefined;
	return {
		...toSitePostSummary(post),
		coverLarge: post.cover ? postImage(post.slug, post.cover, 'web') : null,
		bodyHtml: renderRichText(post.bodyHtml, {
			images,
			imageUrl: (id, variant) => postImageUrl(post.slug, id, variant)
		}),
		groups: post.groupIds
			.map((id) => groups.find((g) => g.id === id))
			.filter((g): g is BackendGroup => !!g)
			.map((g) => ({
				id: g.id,
				name: g.name,
				color: safeColor(g.color),
				href: `/${g.type}/${g.slug}`
			})),
		event: post.eventId ? eventLink(events, post.eventId) : null,
		gallery: gallery ? { id: gallery.id, title: gallery.title } : null,
		updatedAt: post.updatedAt
	};
}

/** Gehört das Bild zu einem veröffentlichten Beitrag? (für den Bild-Proxy; im Zweifel `true`) */
export async function isKnownPostImage(slug: string, imageId: string): Promise<boolean> {
	if (!POST_SLUG_RE.test(slug) || !UUID_RE.test(imageId)) return false;
	try {
		const post = await getPost(slug);
		return !!post && post.images.some((img) => img.id.toLowerCase() === imageId.toLowerCase());
	} catch {
		return true;
	}
}

/** Bild eines Beitrags aus dem Backend (für den Bild-Proxy); `null` bei 404. */
export async function fetchPostImage(
	slug: string,
	imageId: string,
	variant: 'thumb' | 'web'
): Promise<Response | null> {
	const path = buildPath(
		`${CONTENT}/posts/${encodeURIComponent(slug)}/images/${encodeURIComponent(imageId)}/${variant}`
	);
	const res = await request(path, 'image/*');
	if (res.status === 404) return null;
	if (!res.ok) throw new BackendError(res.status, `Bild nicht abrufbar (${res.status})`);
	return res;
}
