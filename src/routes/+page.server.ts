import type { PageServerLoad } from './$types';
import { faqs } from '$lib/faqs';
import { fetchUpcomingEvents } from '$lib/server/backend';

export const load: PageServerLoad = async () => {
    // Termine sind Beiwerk: ohne Backend zeigt die Startseite einen Hinweis statt einer Fehlerseite (`null`)
    const events = await fetchUpcomingEvents({ limit: 4 }).catch(() => null);
    return { faqs, events };
};
