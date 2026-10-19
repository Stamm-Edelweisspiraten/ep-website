import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Alte Adresse /meute: auf die (erste) Meute weiterleiten, sonst zur Gruppenübersicht der Startseite
export const load: PageServerLoad = async ({ parent }) => {
    const { groups } = await parent();
    const meute = groups.find((g) => g.type === 'meute');
    throw redirect(307, meute ? meute.href : '/#gruppen');
};
