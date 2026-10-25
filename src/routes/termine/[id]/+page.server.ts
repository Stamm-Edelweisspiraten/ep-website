import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { fetchEvent, fetchUpcomingEvents } from '$lib/server/backend';

export const prerender = false;

export const load: PageServerLoad = async ({ params, url }) => {
    const event = await fetchEvent(params.id).catch(() => {
        throw error(503, 'Der Termin konnte gerade nicht geladen werden');
    });
    if (!event) throw error(404, 'Termin nicht gefunden');

    const origin = (env.ORIGIN || url.origin).replace(/\/+$/, '');
    // weitere Termine sind Beiwerk (ohne Abruf: Abschnitt fehlt)
    const more = await fetchUpcomingEvents({ limit: 4 })
        .then((list) => list.filter((x) => x.key !== event.key).slice(0, 3))
        .catch(() => []);
    return { event, more, pageUrl: `${origin}/termine/${event.key}`, origin };
};
