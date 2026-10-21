// Bild-Proxy: Galeriebilder kommen mit dem API-Key vom Backend, der Browser sieht nur diese Adresse.
// Bilder werden zwischengespeichert (`lib/server/images.ts`), IDs vorab geprüft, damit zufällige Adressen
// das Backend gar nicht erst erreichen; das Rate-Limit je Besucher-IP sitzt in `hooks.server.ts`.
import { error } from '@sveltejs/kit';
import { UUID_RE } from '$lib/server/cache';
import { imageResponse } from '$lib/server/image-cache';
import { galleryImage } from '$lib/server/images';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, request }) => {
	if (params.variant !== 'thumb' && params.variant !== 'web') throw error(404, 'Nicht gefunden');
	if (!UUID_RE.test(params.id) || !UUID_RE.test(params.imageId)) throw error(404, 'Nicht gefunden');

	const img = await galleryImage(
		params.id.toLowerCase(),
		params.imageId.toLowerCase(),
		params.variant
	).catch(() => {
		throw error(502, 'Bild konnte nicht geladen werden');
	});
	if (!img) throw error(404, 'Bild nicht gefunden');
	return imageResponse(img, request);
};
