import { error } from '@sveltejs/kit';
import { fetchTeam } from '$lib/server/backend';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async () => {
    const offices = await fetchTeam().catch(() => {
        throw error(503, 'Unser Team konnte gerade nicht geladen werden');
    });
    return { offices };
};
