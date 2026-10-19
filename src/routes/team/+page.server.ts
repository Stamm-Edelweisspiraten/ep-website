import { withFirstNames } from '$lib/components/contact/contact';
import { listOffices, safe } from '$lib/server/intern';
import type { PageServerLoad } from './$types';

/**
 * Ämter mit Inhaber*innen – nur Vornamen, damit der volle Name gar nicht erst in der Seite landet.
 * Die Gruppen (Gruppenleitungen) kommen aus dem Layout (`data.groups`).
 */
export const load: PageServerLoad = async () => {
	const offices = await safe(listOffices(), []);
	return { offices: withFirstNames(offices.value), officesError: offices.error };
};
