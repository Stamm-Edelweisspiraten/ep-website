// Bild-Proxy für Blog-Bilder: kommen mit dem API-Key vom Backend, der Browser sieht nur diese Adresse.
// Zwischengespeichert (`lib/server/images.ts`), Adresse und ID vorab geprüft, nur Bilder veröffentlichter Beiträge;
// das Rate-Limit je Besucher-IP sitzt in `hooks.server.ts`.
import { error } from '@sveltejs/kit';
import { POST_SLUG_RE } from '$lib/server/backend';
import { UUID_RE } from '$lib/server/cache';
import { imageResponse } from '$lib/server/image-cache';
import { blogImage } from '$lib/server/images';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, request }) => {
	if (params.variant !== 'thumb' && params.variant !== 'web') throw error(404, 'Nicht gefunden');
	if (!POST_SLUG_RE.test(params.slug) || !UUID_RE.test(params.imageId)) {
		throw error(404, 'Nicht gefunden');
	}

	const img = await blogImage(params.slug, params.imageId.toLowerCase(), params.variant).catch(
		() => {
			throw error(502, 'Bild konnte nicht geladen werden');
		}
	);
	if (!img) throw error(404, 'Bild nicht gefunden');
	return imageResponse(img, request);
};
