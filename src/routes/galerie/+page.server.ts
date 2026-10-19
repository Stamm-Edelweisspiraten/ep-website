import { error } from '@sveltejs/kit';
import { fetchGalleryAppointments } from '$lib/server/backend';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async () => {
    const appointments = await fetchGalleryAppointments().catch(() => {
        throw error(503, 'Die Galerie konnte gerade nicht geladen werden');
    });
    return { appointments };
};
