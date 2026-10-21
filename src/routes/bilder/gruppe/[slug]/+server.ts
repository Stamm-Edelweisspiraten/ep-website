// Bild-Proxy für Gruppenbilder: kommt mit dem API-Key vom Backend, der Browser sieht nur diese Adresse.
// Zwischengespeichert je Slug und aktueller Bildversion, siehe `lib/server/images.ts`.
import { error } from '@sveltejs/kit';
import { SLUG_RE } from '$lib/server/cache';
import { imageResponse } from '$lib/server/image-cache';
import { groupImage } from '$lib/server/images';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url, request }) => {
	if (!SLUG_RE.test(params.slug)) throw error(404, 'Nicht gefunden');
	const version = url.searchParams.get('v') ?? '';
	if (!/^[A-Za-z0-9._-]{0,64}$/.test(version)) throw error(404, 'Nicht gefunden');

	const img = await groupImage(params.slug).catch(() => {
		throw error(502, 'Bild konnte nicht geladen werden');
	});
	if (!img) throw error(404, 'Bild nicht gefunden');
	// ohne Version kann sich das Bild ändern → kürzer im Browser halten
	return imageResponse(
		img,
		request,
		version ? undefined : 'public, max-age=3600, stale-while-revalidate=86400'
	);
};
