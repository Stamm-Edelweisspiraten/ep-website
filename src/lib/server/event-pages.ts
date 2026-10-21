/**
 * Termine seitenweise laden (rein, ohne SvelteKit-Importe – getestet in `tests/unit/website-event-pages.test.ts`
 * des Hauptprojekts).
 *
 * Der Endpunkt `GET /website/events` expandiert Serien in einzelne Vorkommen und liefert höchstens 200 je
 * Abruf. Mit `paged=1` kommt `{ items, total, offset, limit, hasMore }`; wir laden nach, solange `hasMore`.
 * Ein älteres Backend ohne Paging antwortet mit einem Array – dann gilt „volle Seite = vermutlich gekürzt“.
 */
import type { BackendEvent, BackendEventPage } from './backend-types';

export const EVENT_PAGE_SIZE = 200;
/** Harte Obergrenze je Zeitfenster (50 × 200 = 10 000 Vorkommen); darüber wird gekürzt und geloggt */
export const MAX_EVENT_PAGES = 50;

export interface EventWindow {
	from: string;
	to: string;
}

export type EventPageFetcher = (
	query: EventWindow & { limit: number; offset: number; paged: 1 }
) => Promise<BackendEventPage | BackendEvent[]>;

/** Stabiler Schlüssel eines Vorkommens (Serien: `id~occurrenceDate`) */
export function eventKey(e: BackendEvent): string {
	return e.recurring && e.occurrenceDate ? `${e.id}~${e.occurrenceDate}` : e.id;
}

/** Alle Vorkommen eines Fensters laden (nachladen, solange `hasMore`). */
export async function fetchWindow(
	fetchPage: EventPageFetcher,
	window: EventWindow,
	warn: (message: string) => void = console.warn
): Promise<BackendEvent[]> {
	const all: BackendEvent[] = [];
	for (let page = 0; page < MAX_EVENT_PAGES; page++) {
		const res = await fetchPage({
			...window,
			limit: EVENT_PAGE_SIZE,
			offset: all.length,
			paged: 1
		});
		if (Array.isArray(res)) {
			// Backend ohne Paging: nur eine Seite möglich
			all.push(...res);
			if (res.length >= EVENT_PAGE_SIZE) {
				warn(`Termine ${window.from}–${window.to}: Backend ohne Paging, Liste evtl. gekürzt`);
			}
			return all;
		}
		all.push(...res.items);
		if (!res.hasMore || res.items.length === 0) return all;
	}
	warn(
		`Termine ${window.from}–${window.to}: mehr als ${MAX_EVENT_PAGES * EVENT_PAGE_SIZE} Vorkommen, Liste gekürzt`
	);
	return all;
}

/**
 * Mehrere Fenster parallel laden und zusammenführen; mehrtägige Termine, die in zwei Fenster fallen,
 * erscheinen nur einmal (erster Treffer gewinnt).
 */
export async function fetchEventWindows(
	fetchPage: EventPageFetcher,
	windows: EventWindow[],
	warn?: (message: string) => void
): Promise<BackendEvent[]> {
	const chunks = await Promise.all(windows.map((w) => fetchWindow(fetchPage, w, warn)));
	const seen = new Set<string>();
	const result: BackendEvent[] = [];
	for (const event of chunks.flat()) {
		const key = eventKey(event);
		if (seen.has(key)) continue;
		seen.add(key);
		result.push(event);
	}
	return result;
}
