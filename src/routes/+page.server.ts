import type { PageServerLoad } from './$types';
import { fetchGalleries, fetchPosts, fetchUpcomingEvents } from '$lib/server/backend';
import { loadFaqs } from '$lib/server/faqs';

export const load: PageServerLoad = async () => {
    // Termine, Beiträge und Galerien sind Beiwerk: ohne Backend zeigt die Startseite einen Hinweis bzw. lässt den Abschnitt weg
    const [events, posts, galleries, faqs] = await Promise.all([
        fetchUpcomingEvents({ limit: 4 }).catch(() => null),
        fetchPosts({ limit: 4 })
            .then((p) => p.items)
            .catch(() => []),
        fetchGalleries()
            .then((g) => g.slice(0, 4))
            .catch(() => []),
        loadFaqs()
    ]);
    return { faqs: faqs.filter((f) => f.featured), events, posts, galleries };
};
