import { fetchGroups } from '$lib/server/backend';
import type { LayoutServerLoad } from './$types';

// Gruppen aus dem Intern-Bereich für Navigation, Startseite und Kontakt (ohne Backend: leere Liste)
export const load: LayoutServerLoad = async () => {
    const groups = await fetchGroups().catch(() => []);
    return { groups };
};
