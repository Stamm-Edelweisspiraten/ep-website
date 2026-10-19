import { error } from '@sveltejs/kit';
import { isId } from '$lib/images';
import { galleryImagePath } from '$lib/server/intern';
import { proxyImage } from '$lib/server/image-proxy';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ params }) => {
	const { id, imageId, variant } = params;
	if (!isId(id) || !isId(imageId) || (variant !== 'thumb' && variant !== 'web')) {
		error(404, 'Bild nicht gefunden');
	}
	return proxyImage(galleryImagePath(id, imageId, variant));
};
