export const prerender = false;

import { error } from '@sveltejs/kit';
import { fetchGalleryAppointment } from '$lib/server/backend';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
    const appointment = await fetchGalleryAppointment(params.id).catch(() => {
        throw error(503, 'Die Galerie konnte gerade nicht geladen werden');
    });
    if (!appointment) throw error(404, 'Galerie nicht gefunden');

    const firstImage = appointment.pictures[0] ? `${url.origin}${appointment.pictures[0]}` : null;

    const pageUrl = `https://edelweisspiraten-bremen.de/galerie/${appointment.id}`;

    return {
        appointment,
        firstImage,
        pageUrl
    };
};
