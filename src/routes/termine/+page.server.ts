import { error } from '@sveltejs/kit';
import { collectTags, fetchAppointments } from '$lib/server/backend';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async () => {
    const appointments = await fetchAppointments().catch(() => {
        throw error(503, 'Termine konnten gerade nicht geladen werden');
    });

    const tags = collectTags(appointments);

    const years = [...new Set(appointments.map(a => new Date(a.date).getFullYear()))];

    return {
        appointments,
        tags,
        years
    };
};
