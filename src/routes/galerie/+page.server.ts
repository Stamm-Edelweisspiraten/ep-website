import { listGalleries, safe } from '$lib/server/intern';
import { galleryDate } from '$lib/events';
import type { WebsiteGallery } from '$lib/server/types';
import type { PageServerLoad } from './$types';

/** Größe einer API-Seite (Maximum der API) und Obergrenze der geladenen Seiten */
const API_PAGE = 200;
const MAX_API_PAGES = 5;

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

export const load: PageServerLoad = async () => {
	const result = await safe(loadAll(), []);
	const galleries = result.value
		.map((gallery) => ({ gallery, date: galleryDate(gallery) }))
		.sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1))
		.map((entry) => entry.gallery);
	return { galleries, galleriesError: result.error };
};
