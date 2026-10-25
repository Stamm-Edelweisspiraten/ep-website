import type { PageServerLoad } from './$types';
import { fetchPosts } from '$lib/server/backend';
import type { SitePostPage } from '$lib/site-types';

export const prerender = false;

export const load: PageServerLoad = async ({ url }) => {
    const tag = url.searchParams.get('thema')?.trim().slice(0, 40) || null;
    const pageParam = Number(url.searchParams.get('seite') ?? '1');
    const page = Number.isInteger(pageParam) && pageParam >= 1 && pageParam <= 1000 ? pageParam : 1;
    // Backend weg → Hinweis auf der Seite statt Fehlerseite (`posts: null`)
    const posts: SitePostPage | null = await fetchPosts({ tag, page }).catch(() => null);
    return { posts, tag, page };
};
