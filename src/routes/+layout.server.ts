import { fetchBanners, fetchGroups } from '$lib/server/backend';
import type { LayoutServerLoad } from './$types';

// Gruppen aus dem Intern-Bereich für Navigation, Startseite und Kontakt (ohne Backend: leere Liste);
// laufende Banner/Hinweise (ohne Backend bzw. ohne Modul `website`: keine)
export const load: LayoutServerLoad = async () => {
    const [groups, banners] = await Promise.all([
        fetchGroups().catch(() => []),
        fetchBanners().catch(() => [])
    ]);
    return { groups, banners };
};
