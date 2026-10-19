import { listGroups, safe } from '$lib/server/intern';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	const groups = await safe(listGroups(), []);
	return { groups: groups.value, groupsError: groups.error };
};
