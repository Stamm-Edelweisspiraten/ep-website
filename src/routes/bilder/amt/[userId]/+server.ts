import { error } from '@sveltejs/kit';
import { isId, VERSION_PATTERN } from '$lib/images';
import { officeAvatarPath } from '$lib/server/intern';
import { proxyImage } from '$lib/server/image-proxy';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ params, url }) => {
	if (!isId(params.userId)) error(404, 'Bild nicht gefunden');
	const v = url.searchParams.get('v');
	return proxyImage(officeAvatarPath(params.userId), {
		v: v && VERSION_PATTERN.test(v) ? v : undefined
	});
};
