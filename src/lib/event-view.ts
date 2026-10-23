/**
 * Reine Logik der Terminseite: Filtern, Serien zusammenfassen, nach Monaten gruppieren (Root-Test
 * `tests/unit/website-event-view.test.ts`).
 */
import type { SiteEvent, SiteGroupRef } from './site-types';
import { formatDate, formatTimeRange, lastDay, weekdayName } from './dates';

export interface EventFilter {
	/** Gruppen-IDs (mindestens eine muss passen) */
	groups: string[];
	/** Themen (mindestens eines muss passen) */
	tags: string[];
	/** Suche in Titel, Ort und Beschreibung */
	q: string;
}

const fold = (t: string) =>
	t
		.toLocaleLowerCase('de-DE')
		.replace(/ß/g, 'ss')
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '');

export function filterEvents(events: SiteEvent[], f: EventFilter): SiteEvent[] {
	const words = fold(f.q).split(/\s+/).filter(Boolean);
	return events.filter((e) => {
		if (f.groups.length && !e.groups.some((g) => f.groups.includes(g.id))) return false;
		if (f.tags.length && !e.tags.some((t) => f.tags.includes(t))) return false;
		if (!words.length) return true;
		const hay = fold(`${e.title} ${e.location ?? ''} ${e.description}`);
		return words.every((w) => hay.includes(w));
	});
}

/** Alle Gruppen bzw. Themen, die an Terminen vorkommen (nach Name). */
export function collectGroups(events: SiteEvent[]): SiteGroupRef[] {
	const map = new Map<string, SiteGroupRef>();
	for (const e of events) for (const g of e.groups) if (!map.has(g.id)) map.set(g.id, g);
	return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'de'));
}

export function collectTags(events: SiteEvent[]): string[] {
	return [...new Set(events.flatMap((e) => e.tags))].sort((a, b) => a.localeCompare(b, 'de'));
}

export interface SeriesSummary {
	id: string;
	title: string;
	color: string | null;
	groups: SiteGroupRef[];
	location: string | null;
	/** „jeden Freitag“, „alle zwei Wochen freitags“, „monatlich“, „regelmäßig“ */
	rhythm: string;
	/** „16:30–18:00 Uhr“ oder leer */
	time: string;
	/** nächstes Vorkommen (ab heute) */
	next: SiteEvent;
	/** „Fr, 14. Nov. 2026“ */
	nextLabel: string;
	upcomingCount: number;
}

function daysBetween(a: string, b: string): number {
	return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

/** Rhythmus aus den Abständen der Vorkommen (das Backend liefert nur die Vorkommen, nicht die Regel). */
export function describeRhythm(dates: string[]): string {
	const sorted = [...dates].sort();
	if (sorted.length < 2) return 'regelmäßig';
	const gaps = new Set(sorted.slice(1).map((d, i) => daysBetween(sorted[i]!, d)));
	const day = weekdayName(sorted[0]!);
	if (gaps.size === 1 && gaps.has(7)) return `jeden ${day}`;
	if ([...gaps].every((g) => g % 7 === 0) && Math.min(...gaps) === 7) return `${day.toLowerCase()}s (nicht jede Woche)`;
	if (gaps.size === 1 && gaps.has(14)) return `alle zwei Wochen ${day.toLowerCase()}s`;
	if ([...gaps].every((g) => g >= 28 && g <= 31)) return 'monatlich';
	if ([...gaps].every((g) => g === 1)) return 'täglich';
	return 'regelmäßig';
}

/** Serien mit mindestens einem kommenden Vorkommen, nach nächstem Termin sortiert. */
export function summarizeSeries(events: SiteEvent[], today: string): SeriesSummary[] {
	const byId = new Map<string, SiteEvent[]>();
	for (const e of events) {
		if (!e.recurring) continue;
		byId.set(e.id, [...(byId.get(e.id) ?? []), e]);
	}
	const out: SeriesSummary[] = [];
	for (const [id, list] of byId) {
		const upcoming = list.filter((e) => lastDay(e) >= today);
		const next = upcoming[0];
		if (!next) continue;
		out.push({
			id,
			title: next.title,
			color: next.color ?? next.groups.find((g) => g.color)?.color ?? null,
			groups: next.groups,
			location: next.location,
			rhythm: describeRhythm(list.map((e) => e.startsOn)),
			time: formatTimeRange(next.startsTime, next.endsTime),
			next,
			nextLabel: formatDate(next.startsOn),
			upcomingCount: upcoming.length
		});
	}
	return out.sort((a, b) => a.next.startsOn.localeCompare(b.next.startsOn));
}

/** Einzeltermine (ohne Serien), getrennt in kommende (aufsteigend) und vergangene (absteigend). */
export function splitSingles(events: SiteEvent[], today: string) {
	const singles = events.filter((e) => !e.recurring);
	return {
		upcoming: singles.filter((e) => lastDay(e) >= today),
		past: singles.filter((e) => lastDay(e) < today).reverse()
	};
}

/** Nach Monat des Beginns gruppieren (Reihenfolge bleibt erhalten). */
export function groupByMonth(events: SiteEvent[]): { month: string; events: SiteEvent[] }[] {
	const out: { month: string; events: SiteEvent[] }[] = [];
	for (const e of events) {
		const month = e.startsOn.slice(0, 7);
		const last = out[out.length - 1];
		if (last && last.month === month) last.events.push(e);
		else out.push({ month, events: [e] });
	}
	return out;
}

/** Farbe eines Termins: eigene Farbe, sonst die der ersten Gruppe mit Farbe. */
export function eventColor(e: SiteEvent): string | null {
	return e.color ?? e.groups.find((g) => g.color)?.color ?? null;
}
