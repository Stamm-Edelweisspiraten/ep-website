import { listEvents, listGalleries, safe } from '$lib/server/intern';
import { galleryDate, quartersFor } from '$lib/events';
import type { WebsiteEvent, WebsiteGallery } from '$lib/server/types';
import type { PageServerLoad } from './$types';

/** Größe einer API-Seite (Maximum der API) und Obergrenze der geladenen Seiten */
const API_PAGE = 200;
const MAX_API_PAGES = 5;
/** Höchstzahl Termine je Quartalsabruf (Maximum der API, wie auf `/termine`) */
const EVENTS_LIMIT = 200;

/**
 * Alle öffentlichen Galerien in 200er-Blöcken laden (meist ein einziger, gecachter Abruf).
 * Der Jahresfilter braucht alle Galerien, da die API nicht nach Jahr filtern kann; geblättert
 * wird danach auf der Seite (`?seite=`, je 24).
 */
async function loadAll(): Promise<WebsiteGallery[]> {
	const items: WebsiteGallery[] = [];
	for (let page = 0; page < MAX_API_PAGES; page++) {
		const result = await listGalleries({ limit: API_PAGE, offset: page * API_PAGE });
		items.push(...result.items);
		if (result.items.length < API_PAGE || items.length >= result.total) break;
	}
	return items;
}

/**
 * Gruppen je Galerie über die verknüpften Termine (die Galerie-API liefert nur Titel/Datum der
 * Termine). Lädt die Website-Termine der Kalenderquartale, in denen verknüpfte Termine beginnen –
 * dieselben Abrufe wie der Rückblick auf `/termine` (Cache). Fehler → keine Gruppen.
 */
async function groupsOfGalleries(galleries: readonly WebsiteGallery[]) {
	const wanted = new Set(galleries.flatMap((g) => g.events.map((e) => e.id)));
	const quarters = quartersFor(galleries.flatMap((g) => g.events.map((e) => e.startsOn)));
	const results = await Promise.all(
		quarters.map((q) => safe(listEvents({ ...q, limit: EVENTS_LIMIT }), [] as WebsiteEvent[]))
	);

	const byEvent = new Map<string, { id: string; name: string }[]>();
	for (const result of results) {
		for (const event of result.value) {
			if (!wanted.has(event.id) || byEvent.has(event.id)) continue;
			byEvent.set(
				event.id,
				event.groupIds.map((id, i) => ({ id, name: event.groups[i] ?? id }))
			);
		}
	}

	const names: Record<string, string> = {};
	const byGallery: Record<string, string[]> = {};
	for (const gallery of galleries) {
		const ids = new Set<string>();
		for (const ref of gallery.events) {
			for (const group of byEvent.get(ref.id) ?? []) {
				ids.add(group.id);
				names[group.id] = group.name;
			}
		}
		if (ids.size > 0) byGallery[gallery.id] = [...ids];
	}
	return { byGallery, names, error: results.some((r) => r.error) };
}

export const load: PageServerLoad = async () => {
	const result = await safe(loadAll(), []);
	const galleries = result.value
		.map((gallery) => ({ gallery, date: galleryDate(gallery) }))
		.sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1))
		.map((entry) => entry.gallery);
	const groups = result.error
		? { byGallery: {}, names: {}, error: false }
		: await groupsOfGalleries(galleries);
	return {
		galleries,
		galleriesError: result.error,
		/** Galerie-ID → Gruppen-IDs (über verknüpfte Termine) */
		galleryGroups: groups.byGallery,
		/** Gruppen-ID → Name */
		groupNames: groups.names,
		groupsIncomplete: groups.error
	};
};
