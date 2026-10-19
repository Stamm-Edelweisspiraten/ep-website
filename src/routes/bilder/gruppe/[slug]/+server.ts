import { error } from '@sveltejs/kit';
import { isSlug, VERSION_PATTERN } from '$lib/images';
import { groupImagePath } from '$lib/server/intern';
import { proxyImage } from '$lib/server/image-proxy';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ params, url }) => {
	if (!isSlug(params.slug)) error(404, 'Bild nicht gefunden');
	const v = url.searchParams.get('v');
	return proxyImage(groupImagePath(params.slug), {
		v: v && VERSION_PATTERN.test(v) ? v : undefined
	});
};
