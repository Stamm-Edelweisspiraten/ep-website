export const prerender = false;

import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { fetchGallery } from '$lib/server/backend';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
    const gallery = await fetchGallery(params.id).catch(() => {
        throw error(503, 'Die Galerie konnte gerade nicht geladen werden');
    });
    if (!gallery) throw error(404, 'Galerie nicht gefunden');

    const origin = (env.ORIGIN || url.origin).replace(/\/+$/, '');
    return {
        gallery,
        firstImage: gallery.cover ? `${origin}${gallery.cover.url}` : null,
        pageUrl: `${origin}/galerie/${gallery.id}`
    };
};
