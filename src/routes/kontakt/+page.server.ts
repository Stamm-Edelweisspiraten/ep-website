import { listOffices, safe } from '$lib/server/intern';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const offices = await safe(listOffices(), []);
	return {
		offices: offices.value,
		officesError: offices.error,
		success: url.searchParams.get('success') === '1'
	};
};
