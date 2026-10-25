import { error, redirect } from '@sveltejs/kit';
import { fetchGalleries, fetchGroup, fetchUpcomingEvents } from './backend';

/** Gemeinsamer Loader für `/meute/[slug]` und `/sippe/[slug]`; falscher Typ → Weiterleitung auf die richtige Adresse. */
export async function loadGroupPage(type: 'meute' | 'sippe', slug: string) {
    const group = await fetchGroup(slug).catch(() => {
        throw error(503, 'Die Gruppe konnte gerade nicht geladen werden');
    });
    if (!group) throw error(404, 'Gruppe nicht gefunden');
    if (group.type !== type) throw redirect(308, group.href);
    // Termine und Bilder sind Beiwerk: ohne Abruf bleibt die Seite erreichbar (`null` → Hinweis, [] → Abschnitt fehlt)
    const [events, galleries] = await Promise.all([
        fetchUpcomingEvents({ groupSlug: slug, limit: 3 }).catch(() => null),
        fetchGalleries()
            .then((list) => list.filter((g) => g.groups.some((r) => r.href === group.href)).slice(0, 3))
            .catch(() => [])
    ]);
    return { group, events, galleries };
}
