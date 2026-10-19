import { listOffices, safe } from '$lib/server/intern';
import type { PageServerLoad } from './$types';

/** Ämter mit Inhaber*innen; die Gruppen (Gruppenleitungen) kommen aus dem Layout (`data.groups`). */
export const load: PageServerLoad = async () => {
	const offices = await safe(listOffices(), []);
	return { offices: offices.value, officesError: offices.error };
};
