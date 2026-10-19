// Bild-Proxy: Galeriebilder kommen mit dem API-Key vom Backend, der Browser sieht nur diese Adresse.
import { error } from '@sveltejs/kit';
import { fetchImage } from '$lib/server/backend';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	if (params.variant !== 'thumb' && params.variant !== 'web') throw error(404, 'Nicht gefunden');

	const upstream = await fetchImage(params.id, params.imageId, params.variant).catch(() => {
		throw error(502, 'Bild konnte nicht geladen werden');
	});
	if (!upstream || !upstream.body) throw error(404, 'Bild nicht gefunden');

	const type = upstream.headers.get('content-type') ?? '';
	if (!type.startsWith('image/')) throw error(502, 'Ungültige Antwort');

	return new Response(upstream.body, {
		headers: {
			'content-type': type,
			'cache-control': 'public, max-age=3600, stale-while-revalidate=86400',
			'x-content-type-options': 'nosniff'
		}
	});
};
