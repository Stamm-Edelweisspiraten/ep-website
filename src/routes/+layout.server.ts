import { fetchBanners, fetchGroups } from '$lib/server/backend';
import { umamiConfig } from '$lib/server/umami';
import type { LayoutServerLoad } from './$types';

// Gruppen aus dem Intern-Bereich für Navigation, Startseite und Kontakt (ohne Backend: leere Liste);
// laufende Banner/Hinweise (ohne Backend bzw. ohne Modul `website`: keine)
export const load: LayoutServerLoad = async () => {
    const [groups, banners] = await Promise.all([
        fetchGroups().catch(() => []),
        fetchBanners().catch(() => [])
    ]);
    // Besucherstatistik (Umami, selbst gehostet) nur, wenn konfiguriert
    const umamiWebsiteId = umamiConfig()?.websiteId ?? null;
    return { groups, banners, umamiWebsiteId };
};
