// Umami-Tracker über die eigene Domain (siehe `lib/server/umami.ts`). Das Skript wird 6 h im Speicher gehalten;
// ist Umami gerade nicht erreichbar, gibt es den letzten Stand oder ein leeres Skript (Seite funktioniert weiter).
import { umamiConfig } from '$lib/server/umami';
import type { RequestHandler } from './$types';

const TTL_MS = 6 * 60 * 60_000;
let cached: { body: string; at: number; url: string } | null = null;

const js = (body: string, maxAge: number) =>
	new Response(body, {
		headers: {
			'content-type': 'application/javascript; charset=utf-8',
			'cache-control': `public, max-age=${maxAge}`,
			'x-content-type-options': 'nosniff'
		}
	});

export const GET: RequestHandler = async () => {
	const config = umamiConfig();
	if (!config) return new Response('Not found', { status: 404 });
	if (cached && cached.url === config.url && Date.now() - cached.at < TTL_MS) return js(cached.body, 3600);
	try {
		const res = await fetch(`${config.url}/script.js`, { signal: AbortSignal.timeout(4000) });
		const type = res.headers.get('content-type') ?? '';
		if (!res.ok || !/javascript/i.test(type)) throw new Error(`HTTP ${res.status} ${type}`);
		const body = await res.text();
		cached = { body, at: Date.now(), url: config.url };
		return js(body, 3600);
	} catch (err) {
		console.warn(`[umami] script.js: ${err instanceof Error ? err.message : err}`);
		if (cached && cached.url === config.url) return js(cached.body, 300);
		return js('', 60);
	}
};
