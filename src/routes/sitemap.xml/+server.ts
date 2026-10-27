// sitemap.xml: statische Seiten + Gruppen, Termine (ohne Serien-Vorkommen), Galerien und Blogbeiträge.
// Fehlertolerant: ist das Backend weg, enthält sie nur die statischen Seiten (und wird nur kurz gemerkt).
import { fetchEvents, fetchGalleries, fetchGroups, fetchPosts } from '$lib/server/backend';
import { STATIC_PAGES, sitemapXml, type SitemapEntry } from '$lib/server/discovery';
import { siteBase } from '$lib/server/site-url';
import type { SitePostSummary } from '$lib/site-types';
import type { RequestHandler } from './$types';

export const prerender = false;

const FULL_TTL_MS = 60 * 60_000;
const PARTIAL_TTL_MS = 5 * 60_000;
/** Sicherheitsgrenze für Beiträge (100 je Abruf) */
const MAX_POST_PAGES = 20;

let cached: { base: string; xml: string; until: number } | null = null;

async function allPosts(): Promise<SitePostSummary[]> {
	const first = await fetchPosts({ limit: 100 });
	const items = [...first.items];
	for (let page = 2; page <= Math.min(first.pages, MAX_POST_PAGES); page++) {
		items.push(...(await fetchPosts({ limit: 100, page })).items);
	}
	return items;
}

async function build(base: string): Promise<{ xml: string; complete: boolean }> {
	const [groups, events, galleries, posts] = await Promise.allSettled([
		fetchGroups(),
		fetchEvents(),
		fetchGalleries(),
		allPosts()
	]);
	const entries: SitemapEntry[] = STATIC_PAGES.map((p) => ({ ...p }));
	if (groups.status === 'fulfilled') {
		entries.push(
			...groups.value.map((g) => ({ path: g.href, changefreq: 'monthly', priority: 0.8 }))
		);
	}
	if (events.status === 'fulfilled') {
		entries.push(
			...events.value
				.filter((e) => !e.recurring)
				.map((e) => ({ path: `/termine/${e.key}`, changefreq: 'monthly', priority: 0.5 }))
		);
	}
	if (galleries.status === 'fulfilled') {
		entries.push(
			...galleries.value.map((g) => ({
				path: `/galerie/${g.id}`,
				changefreq: 'monthly',
				priority: 0.5
			}))
		);
	}
	if (posts.status === 'fulfilled') {
		entries.push(
			...posts.value.map((p) => ({
				path: p.href,
				lastmod: p.publishedAt,
				changefreq: 'monthly',
				priority: 0.6
			}))
		);
	}
	const complete = [groups, events, galleries, posts].every((r) => r.status === 'fulfilled');
	return { xml: sitemapXml(base, entries), complete };
}

export const GET: RequestHandler = async ({ url }) => {
	const base = siteBase(url);
	const now = Date.now();
	if (!cached || cached.base !== base || cached.until <= now) {
		const { xml, complete } = await build(base);
		cached = { base, xml, until: now + (complete ? FULL_TTL_MS : PARTIAL_TTL_MS) };
	}
	return new Response(cached.xml, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
};
