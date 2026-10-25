import type { PageServerLoad } from './$types';
import { fetchPosts, fetchUpcomingEvents } from '$lib/server/backend';
import { loadFaqs } from '$lib/server/faqs';

export const load: PageServerLoad = async () => {
    // Termine und Beiträge sind Beiwerk: ohne Backend zeigt die Startseite einen Hinweis bzw. lässt den Abschnitt weg
    const [events, posts, faqs] = await Promise.all([
        fetchUpcomingEvents({ limit: 4 }).catch(() => null),
        fetchPosts({ limit: 3 })
            .then((p) => p.items)
            .catch(() => []),
        loadFaqs()
    ]);
    return { faqs: faqs.filter((f) => f.featured), events, posts };
};
