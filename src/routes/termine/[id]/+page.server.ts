import { error } from '@sveltejs/kit';
import { getEvent, InternApiError, listGalleries, safe } from '$lib/server/intern';
import { isIsoDate } from '$lib/events';
import { isId } from '$lib/images';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	if (!isId(params.id)) error(404, 'Termin nicht gefunden');
	const am = url.searchParams.get('am');
	const occurrence = isIsoDate(am) ? am : undefined;

	const [event, galleries] = await Promise.all([
		getEvent(params.id, occurrence).catch((err: unknown) => {
			const detail = err instanceof InternApiError ? `${err.status} ${err.message}` : String(err);
			console.warn(`[termine] ${params.id}: ${detail}`);
			error(503, 'Der Termin konnte gerade nicht geladen werden');
		}),
		safe(listGalleries({ eventId: params.id, limit: 24 }), { items: [], total: 0 })
	]);
	if (!event) error(404, 'Termin nicht gefunden');

	return {
		event,
		galleries: galleries.value.items,
		galleriesError: galleries.error
	};
};
