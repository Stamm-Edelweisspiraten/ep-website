import { error } from '@sveltejs/kit';
import { fetchEvents } from '$lib/server/backend';
import { todayBerlin } from '$lib/dates';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async () => {
    const events = await fetchEvents().catch(() => {
        throw error(503, 'Termine konnten gerade nicht geladen werden');
    });
    return { events, today: todayBerlin() };
};
