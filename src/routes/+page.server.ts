import { listEvents, safe } from '$lib/server/intern';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const events = await safe(listEvents({ limit: 3 }), []);
	return { events: events.value, eventsError: events.error };
};
