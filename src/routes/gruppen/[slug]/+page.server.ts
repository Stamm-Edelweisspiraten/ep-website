import { error } from '@sveltejs/kit';
import { isSlug } from '$lib/images';
import { getGroup, listEvents, safe } from '$lib/server/intern';
import type { WebsiteGroup } from '$lib/server/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	if (!isSlug(params.slug)) error(404, 'Gruppe nicht gefunden');

	let group: WebsiteGroup | null;
	try {
		group = await getGroup(params.slug);
	} catch (err) {
		console.warn(`[intern] Gruppe ${params.slug} konnte nicht geladen werden`, err);
		error(503, 'Die Gruppe konnte gerade nicht geladen werden');
	}
	if (!group) error(404, 'Gruppe nicht gefunden');

	const events = await safe(listEvents({ group: group.id, limit: 3 }), []);
	return { group, events: events.value, eventsError: events.error };
};
