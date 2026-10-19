/**
 * Hilfen für Termine und Galerien (Client-sicher, ohne Server-Importe außer Typen).
 */
import type { WebsiteEvent, WebsiteGallery, WebsiteGroup } from '$lib/server/types';
import {
	formatDate,
	formatDateRange,
	formatDateShort,
	parseDate,
	todayIso,
	weekdayAdverb
} from './format';

/** Link zur Detailseite; Serien-Vorkommen mit `?am=<Datum>` */
export function eventHref(
	event: Pick<WebsiteEvent, 'id' | 'recurring' | 'occurrenceDate'>
): string {
	const base = `/termine/${event.id}`;
	return event.recurring && event.occurrenceDate ? `${base}?am=${event.occurrenceDate}` : base;
}

/** Stabiler Schlüssel für `{#each}` (Serien haben je Vorkommen dieselbe `id`) */
export function eventKey(event: Pick<WebsiteEvent, 'id' | 'occurrenceDate'>): string {
	return event.occurrenceDate ? `${event.id}:${event.occurrenceDate}` : event.id;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Echtes Kalenderdatum im Format `YYYY-MM-DD` (z. B. für `?am=`). */
export function isIsoDate(value: string | null | undefined): value is string {
	return typeof value === 'string' && ISO_DATE_RE.test(value) && parseDate(value) !== null;
}

/** `YYYY-MM-DD` um `days` Tage verschieben. */
export function addDays(iso: string, days: number): string {
	const date = parseDate(iso);
	if (!date) return iso;
	date.setUTCDate(date.getUTCDate() + days);
	return date.toISOString().slice(0, 10);
}

// --- Uhrzeit / Zeitraum --------------------------------------------------------

/**
 * Kurzer Zeit-Hinweis neben der Datumskachel:
 * - ein Tag ohne Uhrzeit → „Ganztägig“
 * - ein Tag mit Uhrzeit → „16:30 Uhr“ / „16:30–18:00 Uhr“
 * - mehrtägig → „bis Sa., 26.12.“ (mit Uhrzeiten: „16:30 Uhr bis Sa., 26.12., 12:00 Uhr“)
 */
export function eventWhen(
	event: Pick<WebsiteEvent, 'startsOn' | 'startsTime' | 'endsOn' | 'endsTime'>
): string {
	const multiDay = Boolean(
		event.endsOn && event.endsOn !== event.startsOn && parseDate(event.endsOn)
	);
	if (!multiDay) {
		const range = formatDateRange(event);
		const comma = range.indexOf(', ');
		return comma >= 0 ? range.slice(comma + 2) : 'Ganztägig';
	}
	const start = event.startsTime ? `${event.startsTime} Uhr ` : '';
	const end = event.endsTime ? `, ${event.endsTime} Uhr` : '';
	return `${start}bis ${formatDateShort(event.endsOn)}${end}`;
}

/** `true`, wenn der Termin vor `today` endet. */
export function isPastEvent(
	event: Pick<WebsiteEvent, 'startsOn' | 'endsOn'>,
	today: string = todayIso()
): boolean {
	return (event.endsOn ?? event.startsOn) < today;
}

// --- Gruppierung nach Monat ----------------------------------------------------

const MONTHS_LONG = [
	'Januar',
	'Februar',
	'März',
	'April',
	'Mai',
	'Juni',
	'Juli',
	'August',
	'September',
	'Oktober',
	'November',
	'Dezember'
] as const;

/** „2026-10“ → „Oktober 2026“ */
export function monthLabel(monthKey: string): string {
	const m = /^(\d{4})-(\d{2})$/.exec(monthKey);
	const name = m ? MONTHS_LONG[Number(m[2]) - 1] : undefined;
	return m && name ? `${name} ${m[1]}` : monthKey;
}

export interface EventMonth<T> {
	/** `YYYY-MM` */
	key: string;
	label: string;
	events: T[];
}

/**
 * Termine nach Startmonat gruppieren. Reihenfolge der Termine bleibt erhalten; Monate erscheinen
 * in der Reihenfolge ihres ersten Termins (also wie sortiert übergeben).
 */
export function groupByMonth<T extends Pick<WebsiteEvent, 'startsOn'>>(
	events: readonly T[]
): EventMonth<T>[] {
	const months = new Map<string, EventMonth<T>>();
	for (const event of events) {
		const key = event.startsOn.slice(0, 7);
		let month = months.get(key);
		if (!month) {
			month = { key, label: monthLabel(key), events: [] };
			months.set(key, month);
		}
		month.events.push(event);
	}
	return [...months.values()];
}

/** Nach Start (Datum + Uhrzeit) sortieren; `desc` für den Rückblick. */
export function sortEvents<T extends Pick<WebsiteEvent, 'startsOn' | 'startsTime' | 'title'>>(
	events: readonly T[],
	direction: 'asc' | 'desc' = 'asc'
): T[] {
	const factor = direction === 'asc' ? 1 : -1;
	return [...events].sort((a, b) => {
		const ka = `${a.startsOn}T${a.startsTime ?? '00:00'}`;
		const kb = `${b.startsOn}T${b.startsTime ?? '00:00'}`;
		if (ka !== kb) return ka < kb ? -factor : factor;
		return a.title.localeCompare(b.title, 'de');
	});
}

// --- Filter --------------------------------------------------------------------

export interface FilterOption {
	/** Wert für die URL bzw. den Vergleich */
	value: string;
	label: string;
	count: number;
}

/** Alle vorkommenden Tags mit Anzahl, alphabetisch. */
export function collectTags(events: readonly Pick<WebsiteEvent, 'tags'>[]): FilterOption[] {
	const counts = new Map<string, number>();
	for (const event of events) {
		for (const tag of new Set(event.tags)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
	}
	return [...counts.entries()]
		.map(([value, count]) => ({ value, label: value, count }))
		.sort((a, b) => a.label.localeCompare(b.label, 'de'));
}

/** Alle vorkommenden Gruppen (`groupIds`/`groups`) mit Anzahl; „ganzer Stamm“ zuerst. */
export function collectGroups(
	events: readonly Pick<WebsiteEvent, 'groups' | 'groupIds'>[]
): FilterOption[] {
	const map = new Map<string, FilterOption>();
	for (const event of events) {
		const seen = new Set<string>();
		event.groupIds.forEach((id, i) => {
			if (seen.has(id)) return;
			seen.add(id);
			const option = map.get(id);
			if (option) option.count += 1;
			else map.set(id, { value: id, label: event.groups[i] ?? id, count: 1 });
		});
	}
	return [...map.values()].sort((a, b) => {
		if (a.value === 'stamm' || b.value === 'stamm') return a.value === 'stamm' ? -1 : 1;
		return a.label.localeCompare(b.label, 'de');
	});
}

export interface EventFilter {
	tag?: string | null;
	/** Gruppen-ID oder `stamm` */
	group?: string | null;
}

export function filterEvents<T extends Pick<WebsiteEvent, 'tags' | 'groupIds'>>(
	events: readonly T[],
	filter: EventFilter
): T[] {
	return events.filter(
		(e) =>
			(!filter.tag || e.tags.includes(filter.tag)) &&
			(!filter.group || e.groupIds.includes(filter.group))
	);
}

type GroupRef = Pick<WebsiteGroup, 'id' | 'slug'>;

/** `?gruppe=` akzeptiert den Gruppen-Slug (bevorzugt) oder die Gruppen-ID bzw. `stamm`. */
export function resolveGroupParam(
	value: string | null | undefined,
	groups: readonly GroupRef[]
): string | null {
	if (!value) return null;
	return groups.find((g) => g.slug === value)?.id ?? value;
}

/** Wert für `?gruppe=`: Slug, wenn die Gruppe eine Website-Seite hat, sonst die ID. */
export function groupParamValue(groupId: string, groups: readonly GroupRef[]): string {
	return groups.find((g) => g.id === groupId)?.slug ?? groupId;
}

/** Gruppen eines Termins mit Link zur Gruppen-Seite (falls vorhanden). */
export function eventGroupLinks(
	event: Pick<WebsiteEvent, 'groups' | 'groupIds'>,
	groups: readonly GroupRef[]
): { id: string; name: string; href: string | null }[] {
	return event.groupIds.map((id, i) => {
		const slug = groups.find((g) => g.id === id)?.slug;
		return {
			id,
			name: event.groups[i] ?? '',
			href: slug ? `/gruppen/${encodeURIComponent(slug)}` : null
		};
	});
}

/**
 * URL-Suchteil aus Parametern bauen (leere Werte fallen weg), z. B. `?tag=Fahrt` oder `''`.
 * Reihenfolge fest, damit Links stabil sind.
 */
export function buildSearch(params: Record<string, string | number | null | undefined>): string {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value === null || value === undefined || value === '') continue;
		search.set(key, String(value));
	}
	const qs = search.toString();
	return qs ? `?${qs}` : '';
}

// --- Rückblick -----------------------------------------------------------------

/** Ältestes Jahr im Rückblick */
export const FIRST_REVIEW_YEAR = 2023;

/** Jahre für den Rückblick: aktuelles Jahr bis 2023, absteigend. */
export function reviewYears(today: string = todayIso(), first = FIRST_REVIEW_YEAR): number[] {
	const current = Number(today.slice(0, 4));
	const years: number[] = [];
	for (let y = current; y >= first; y--) years.push(y);
	return years;
}

/** `?rueckblick=JJJJ` prüfen: nur Jahre aus `reviewYears`. */
export function parseReviewYear(
	value: string | null | undefined,
	today: string = todayIso()
): number | null {
	if (!value || !/^\d{4}$/.test(value)) return null;
	const year = Number(value);
	return reviewYears(today).includes(year) ? year : null;
}

/**
 * Zeitraum eines Rückblick-Jahres: ganzes Jahr, im laufenden Jahr nur bis gestern.
 * `null`, wenn der Zeitraum leer ist (1. Januar des laufenden Jahres).
 */
export function reviewRange(
	year: number,
	today: string = todayIso()
): { from: string; to: string } | null {
	const from = `${year}-01-01`;
	const yearEnd = `${year}-12-31`;
	const yesterday = addDays(today, -1);
	const to = yesterday < yearEnd ? yesterday : yearEnd;
	return to < from ? null : { from, to };
}

// --- Ort -------------------------------------------------------------------------

/** Suche nach dem Ort bei OpenStreetMap */
export function osmSearchUrl(location: string): string {
	return `https://www.openstreetmap.org/search?query=${encodeURIComponent(location.trim())}`;
}

// --- Galerien --------------------------------------------------------------------

/**
 * Datum einer Galerie: Start des frühesten verknüpften Termins, sonst Tag der letzten Änderung
 * (Berlin). `YYYY-MM-DD` oder `''`.
 */
export function galleryDate(gallery: Pick<WebsiteGallery, 'events' | 'updatedAt'>): string {
	const starts = gallery.events.map((e) => e.startsOn).filter((d) => isIsoDate(d));
	if (starts.length > 0) return starts.sort()[0]!;
	const updated = new Date(gallery.updatedAt);
	return Number.isNaN(updated.getTime()) ? '' : todayIso(updated);
}

/** Jahr einer Galerie (aus `galleryDate`) oder `null`. */
export function galleryYear(gallery: Pick<WebsiteGallery, 'events' | 'updatedAt'>): number | null {
	const date = galleryDate(gallery);
	return date ? Number(date.slice(0, 4)) : null;
}

/** „1 Bild“ / „12 Bilder“ */
export function imageCountLabel(count: number): string {
	return count === 1 ? '1 Bild' : `${count} Bilder`;
}

/** Seitenzahl aus `?seite=` (1-basiert, ungültig → 1). */
export function parsePage(value: string | null | undefined): number {
	if (!value || !/^\d{1,4}$/.test(value)) return 1;
	const n = Number(value);
	return n >= 1 ? n : 1;
}

// --- Serien ----------------------------------------------------------------------

/** Ganze Tage zwischen zwei `YYYY-MM-DD` (b − a). */
export function daysBetween(a: string, b: string): number {
	const da = parseDate(a);
	const db = parseDate(b);
	if (!da || !db) return NaN;
	return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

function gcd(a: number, b: number): number {
	return b === 0 ? a : gcd(b, a % b);
}

/** Wochentag 1 = Montag … 7 = Sonntag */
function isoWeekday(iso: string): number {
	const day = parseDate(iso)?.getUTCDay() ?? 0;
	return day === 0 ? 7 : day;
}

function joinGerman(items: string[]): string {
	if (items.length <= 1) return items.join('');
	return `${items.slice(0, -1).join(', ')} und ${items[items.length - 1]}`;
}

const EVERY_N_WEEKS: Record<number, string> = { 2: 'zwei', 3: 'drei', 4: 'vier' };

/**
 * Rhythmus einer Serie aus ihren Vorkommen, z. B. „freitags 16:30–18:00 Uhr“,
 * „alle zwei Wochen samstags“, „montags und mittwochs“, „täglich“, „monatlich am 3.“;
 * bei unregelmäßigen Abständen (oder nur einem Vorkommen) „regelmäßig“.
 * Abgesagte Vorkommen (Lücken) stören die Erkennung nicht.
 */
export function seriesRhythm(
	occurrences: readonly Pick<WebsiteEvent, 'startsOn' | 'startsTime' | 'endsTime'>[]
): string {
	const dates = [...new Set(occurrences.map((o) => o.startsOn).filter((d) => isIsoDate(d)))].sort();
	let rhythm = 'regelmäßig';
	if (dates.length >= 2) {
		const diffs = dates.slice(1).map((d, i) => daysBetween(dates[i]!, d));
		const step = diffs.reduce((acc, d) => gcd(acc, d), 0);
		const weekdays = [...new Set(dates.map(isoWeekday))].sort((a, b) => a - b);
		const daysOfMonth = new Set(dates.map((d) => d.slice(8)));
		if (step === 1 && weekdays.length === 7) {
			rhythm = 'täglich';
		} else if (weekdays.length === 1 && step % 7 === 0) {
			const weeks = step / 7;
			const day = weekdayAdverb(weekdays[0]);
			if (weeks === 1) rhythm = day;
			else if (EVERY_N_WEEKS[weeks]) rhythm = `alle ${EVERY_N_WEEKS[weeks]} Wochen ${day}`;
		} else if (weekdays.length > 1 && weekdays.length <= 3 && Math.max(...diffs) <= 7) {
			rhythm = joinGerman(weekdays.map((d) => weekdayAdverb(d)));
		} else if (daysOfMonth.size === 1 && diffs.every((d) => d >= 28)) {
			rhythm = `monatlich am ${Number(dates[0]!.slice(8))}.`;
		}
	}

	const starts = new Set(occurrences.map((o) => o.startsTime ?? ''));
	const ends = new Set(occurrences.map((o) => o.endsTime ?? ''));
	const start = starts.size === 1 ? [...starts][0] : '';
	if (!start) return rhythm;
	const end = ends.size === 1 ? [...ends][0] : '';
	const time = end && end !== start ? `${start}–${end} Uhr` : `${start} Uhr`;
	return rhythm === 'regelmäßig' ? `regelmäßig, ${time}` : `${rhythm} ${time}`;
}

export interface EventSeries<T extends WebsiteEvent = WebsiteEvent> {
	/** Serien-`id` */
	id: string;
	/** Erstes Vorkommen in Eingabereihenfolge (kommend: nächster Termin, Rückblick: letzter) */
	event: T;
	/** Frühestes / spätestes Vorkommen (`YYYY-MM-DD`) */
	first: string;
	last: string;
	count: number;
	rhythm: string;
}

/**
 * Serien (`recurring`, gleiche `id`) zu je einem Eintrag zusammenfassen. Reihenfolge der Serien und
 * Einzeltermine folgt der Eingabe; Einzeltermine bleiben unverändert.
 */
export function collapseSeries<T extends WebsiteEvent>(
	events: readonly T[]
): { series: EventSeries<T>[]; singles: T[] } {
	const groups = new Map<string, T[]>();
	const singles: T[] = [];
	for (const event of events) {
		if (!event.recurring) {
			singles.push(event);
			continue;
		}
		const list = groups.get(event.id);
		if (list) list.push(event);
		else groups.set(event.id, [event]);
	}
	const series = [...groups.entries()].map(([id, list]) => {
		const dates = list.map((e) => e.startsOn).sort();
		return {
			id,
			event: list[0]!,
			first: dates[0]!,
			last: dates[dates.length - 1]!,
			count: list.length,
			rhythm: seriesRhythm(list)
		};
	});
	return { series, singles };
}

/**
 * Zeitraum `[from, to]` in Blöcke von höchstens `months` Monaten teilen (die API liefert höchstens
 * 200 Termine je Abruf – wöchentliche Serien würden ein Jahr sonst abschneiden).
 */
export function splitRange(from: string, to: string, months = 3): { from: string; to: string }[] {
	const chunks: { from: string; to: string }[] = [];
	let start = from;
	while (start <= to && chunks.length < 24) {
		const d = parseDate(start);
		if (!d) break;
		const next = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1, 12));
		const nextIso = next.toISOString().slice(0, 10);
		const end = addDays(nextIso, -1);
		chunks.push({ from: start, to: end < to ? end : to });
		start = nextIso;
	}
	return chunks;
}

// --- Darstellung wie auf der alten Website -------------------------------------

const WEEKDAYS_SHORT_DE = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'] as const;

function longDay(date: Date, withWeekday: boolean, withYear: boolean): string {
	const day = `${date.getUTCDate()}. ${MONTHS_LONG[date.getUTCMonth()]}`;
	const text = withYear ? `${day} ${date.getUTCFullYear()}` : day;
	return withWeekday ? `${WEEKDAYS_SHORT_DE[date.getUTCDay()]}, ${text}` : text;
}

/**
 * Datum eines Termins ausgeschrieben (wie die alte Website):
 * - „Sa., 24. Oktober 2026“, mit Uhrzeit „Sa., 24. Oktober 2026, 16:30–18:00 Uhr“
 * - mehrtägig: „24.–26. Oktober 2026“, „30. September – 2. Oktober 2026“,
 *   „Mi., 30. Dezember 2026 – Sa., 2. Januar 2027“
 * - mehrtägig mit Uhrzeiten: „Fr., 23. Oktober 2026, 16:00 Uhr – So., 25. Oktober 2026, 13:00 Uhr“
 */
export function formatEventDate(
	event: Pick<WebsiteEvent, 'startsOn' | 'startsTime' | 'endsOn' | 'endsTime'>
): string {
	const start = parseDate(event.startsOn);
	if (!start) return '';
	const end = event.endsOn && event.endsOn !== event.startsOn ? parseDate(event.endsOn) : null;
	const time = (value: string | null) => (value && /^\d{2}:\d{2}$/.test(value) ? value : null);
	const startTime = time(event.startsTime);
	const endTime = time(event.endsTime);

	if (!end) {
		const day = longDay(start, true, true);
		if (!startTime) return day;
		if (endTime && endTime !== startTime) return `${day}, ${startTime}–${endTime} Uhr`;
		return `${day}, ${startTime} Uhr`;
	}
	if (startTime || endTime) {
		const from = `${longDay(start, true, true)}${startTime ? `, ${startTime} Uhr` : ''}`;
		const to = `${longDay(end, true, true)}${endTime ? `, ${endTime} Uhr` : ''}`;
		return `${from} – ${to}`;
	}
	const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
	if (sameYear && start.getUTCMonth() === end.getUTCMonth()) {
		return `${start.getUTCDate()}.–${longDay(end, false, true)}`;
	}
	if (sameYear) return `${longDay(start, false, false)} – ${longDay(end, false, true)}`;
	return `${longDay(start, true, true)} – ${longDay(end, true, true)}`;
}

/** Lesbare Schriftfarbe auf einer Hintergrundfarbe `#rrggbb` (sonst dunkles Grau). */
export function contrastText(background: string | null | undefined): string {
	const m = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(background ?? '');
	if (!m) return '#1f2937';
	const [r, g, b] = [m[1], m[2], m[3]].map((hex) => parseInt(hex ?? '0', 16) / 255) as [
		number,
		number,
		number
	];
	return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.6 ? '#111827' : '#ffffff';
}

/**
 * Datumszeile einer Galerie: Zeitraum des frühesten verknüpften Termins („24.–26.10.2026“),
 * sonst Tag der letzten Änderung.
 */
export function galleryDateLabel(gallery: Pick<WebsiteGallery, 'events' | 'updatedAt'>): string {
	const first = [...gallery.events]
		.filter((e) => isIsoDate(e.startsOn))
		.sort((a, b) => (a.startsOn < b.startsOn ? -1 : a.startsOn > b.startsOn ? 1 : 0))[0];
	if (first) return formatDateRange({ startsOn: first.startsOn, endsOn: first.endsOn });
	return formatDate(galleryDate(gallery));
}

/**
 * Kalenderquartale (`from`/`to`), die die angegebenen Daten enthalten – dedupliziert, sortiert.
 * Gleiche Grenzen wie der Rückblick auf `/termine`, damit sich die Abrufe den Cache teilen.
 */
export function quartersFor(dates: readonly string[]): { from: string; to: string }[] {
	const keys = new Set<string>();
	for (const date of dates) {
		if (!isIsoDate(date)) continue;
		const year = date.slice(0, 4);
		const q = Math.floor((Number(date.slice(5, 7)) - 1) / 3);
		keys.add(`${year}-${String(q * 3 + 1).padStart(2, '0')}-01`);
	}
	return [...keys].sort().map((from) => {
		const d = parseDate(from)!;
		const next = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 3, 1, 12));
		return { from, to: addDays(next.toISOString().slice(0, 10), -1) };
	});
}
