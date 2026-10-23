// Bild-Proxy für Profilbilder auf „Unser Team“: kommt mit dem API-Key vom Backend, der Browser sieht nur diese Adresse.
// Nur Personen, die der Anzeige auf der Website zugestimmt haben; zwischengespeichert je Person und Bildversion.
import { error } from '@sveltejs/kit';
import { imageResponse } from '$lib/server/image-cache';
import { teamImage } from '$lib/server/images';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url, request }) => {
	if (!/^[A-Za-z0-9_-]{1,64}$/.test(params.userId)) throw error(404, 'Nicht gefunden');
	const version = url.searchParams.get('v') ?? '';
	if (!/^[A-Za-z0-9._-]{0,64}$/.test(version)) throw error(404, 'Nicht gefunden');

	const img = await teamImage(params.userId).catch(() => {
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
