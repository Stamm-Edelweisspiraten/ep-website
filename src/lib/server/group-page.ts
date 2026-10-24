import { error, redirect } from '@sveltejs/kit';
import { fetchGroup, fetchUpcomingEvents } from './backend';

/** Gemeinsamer Loader für `/meute/[slug]` und `/sippe/[slug]`; falscher Typ → Weiterleitung auf die richtige Adresse. */
export async function loadGroupPage(type: 'meute' | 'sippe', slug: string) {
    const group = await fetchGroup(slug).catch(() => {
        throw error(503, 'Die Gruppe konnte gerade nicht geladen werden');
    });
    if (!group) throw error(404, 'Gruppe nicht gefunden');
    if (group.type !== type) throw redirect(308, group.href);
    // Termine sind Beiwerk: ohne Terminabruf bleibt die Seite erreichbar (`null` → Hinweis)
    const events = await fetchUpcomingEvents({ groupSlug: slug, limit: 3 }).catch(() => null);
    return { group, events };
}
