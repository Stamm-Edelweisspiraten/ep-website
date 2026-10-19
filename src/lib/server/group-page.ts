import { error, redirect } from '@sveltejs/kit';
import { fetchGroup } from './backend';

/** Gemeinsamer Loader für `/meute/[slug]` und `/sippe/[slug]`; falscher Typ → Weiterleitung auf die richtige Adresse. */
export async function loadGroupPage(type: 'meute' | 'sippe', slug: string) {
    const group = await fetchGroup(slug).catch(() => {
        throw error(503, 'Die Gruppe konnte gerade nicht geladen werden');
    });
    if (!group) throw error(404, 'Gruppe nicht gefunden');
    if (group.type !== type) throw redirect(308, group.href);
    return { group };
}
