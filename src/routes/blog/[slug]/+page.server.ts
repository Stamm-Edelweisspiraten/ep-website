import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { fetchPost } from '$lib/server/backend';

export const prerender = false;

export const load: PageServerLoad = async ({ params, url }) => {
    const post = await fetchPost(params.slug).catch(() => {
        throw error(503, 'Der Beitrag konnte gerade nicht geladen werden');
    });
    if (!post) throw error(404, 'Beitrag nicht gefunden');

    const origin = (env.ORIGIN || url.origin).replace(/\/+$/, '');
    return { post, pageUrl: `${origin}${post.href}`, origin };
};
