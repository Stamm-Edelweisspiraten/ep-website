import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { fetchAppointmentById } from '$lib/server/backend';

export const prerender = false;

export const load: PageServerLoad = async ({ params }) => {
    const appointment = await fetchAppointmentById(params.id).catch(() => {
        throw error(503, 'Fehler beim Laden des Termins');
    });

    if (!appointment) throw error(404, 'Termin nicht gefunden');

    return { appointment };
};
