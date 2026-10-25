export const prerender = false;

import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { fetchGalleries, fetchGallery } from '$lib/server/backend';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
    const gallery = await fetchGallery(params.id).catch(() => {
        throw error(503, 'Die Galerie konnte gerade nicht geladen werden');
    });
    if (!gallery) throw error(404, 'Galerie nicht gefunden');

    const origin = (env.ORIGIN || url.origin).replace(/\/+$/, '');
    // weitere Alben sind Beiwerk
    const more = await fetchGalleries()
        .then((list) => list.filter((g) => g.id !== gallery.id).slice(0, 3))
        .catch(() => []);
    return {
        gallery,
        more,
        firstImage: gallery.cover ? `${origin}${gallery.cover.url}` : null,
        pageUrl: `${origin}/galerie/${gallery.id}`
    };
};
