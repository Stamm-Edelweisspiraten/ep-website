// llms.txt (https://llmstxt.org): Kurzbeschreibung des Stamms für Sprachmodelle – Gruppen, Treffpunkt, Kontakt,
// wichtige Seiten und die nächsten Termine. Ohne Backend fehlen Gruppen/Termine (Hinweis im Text).
import { fetchGroups, fetchUpcomingEvents } from '$lib/server/backend';
import { llmsTxt } from '$lib/server/discovery';
import { siteBase } from '$lib/server/site-url';
import { formatWhen } from '$lib/dates';
import type { RequestHandler } from './$types';

export const prerender = false;

const TTL_MS = 60 * 60_000;
let cached: { base: string; text: string; until: number } | null = null;

export const GET: RequestHandler = async ({ url }) => {
	const base = siteBase(url);
	const now = Date.now();
	if (!cached || cached.base !== base || cached.until <= now) {
		const [groups, events] = await Promise.all([
			fetchGroups().catch(() => null),
			fetchUpcomingEvents({ limit: 5 }).catch(() => null)
		]);
		const text = llmsTxt(base, {
			groups: groups ?? [],
			events:
				events?.map((e) => ({
					key: e.key,
					title: e.title,
					when: formatWhen(e),
					location: e.location
				})) ?? null
		});
		// unvollständige Fassung (Backend weg) nur kurz merken
		cached = { base, text, until: now + (groups && events ? TTL_MS : 5 * 60_000) };
	}
	return new Response(cached.text, {
		headers: {
			'content-type': 'text/markdown; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
};
