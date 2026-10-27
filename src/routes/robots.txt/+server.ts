// robots.txt: alles erlaubt außer der Spam-Schutz-Aufgabe und der Bot-Falle; KI-Crawler ausdrücklich willkommen.
import { robotsTxt } from '$lib/server/discovery';
import { siteBase } from '$lib/server/site-url';
import type { RequestHandler } from './$types';

export const prerender = false;

export const GET: RequestHandler = ({ url }) =>
	new Response(robotsTxt(siteBase(url)), {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'public, max-age=86400'
		}
	});
