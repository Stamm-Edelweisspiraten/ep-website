import { error } from '@sveltejs/kit';
import { getGallery, InternApiError } from '$lib/server/intern';
import { isId } from '$lib/images';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	if (!isId(params.id)) error(404, 'Galerie nicht gefunden');
	let gallery;
	try {
		gallery = await getGallery(params.id);
	} catch (err) {
		const detail = err instanceof InternApiError ? `${err.status} ${err.message}` : String(err);
		console.warn(`[galerie] ${params.id}: ${detail}`);
		error(503, 'Die Galerie konnte gerade nicht geladen werden');
	}
	if (!gallery) error(404, 'Galerie nicht gefunden');
	return {
		gallery: {
			...gallery,
			images: [...gallery.images].sort((a, b) => a.position - b.position)
		}
	};
};
