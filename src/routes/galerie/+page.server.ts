import { error } from '@sveltejs/kit';
import { fetchGalleries } from '$lib/server/backend';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async () => {
    const galleries = await fetchGalleries().catch(() => {
        throw error(503, 'Die Galerie konnte gerade nicht geladen werden');
    });
    return { galleries };
};
