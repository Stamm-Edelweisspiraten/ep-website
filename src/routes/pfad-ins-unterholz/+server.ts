// Bot-Falle (siehe `lib/server/bot-trap.ts`): nur über einen unsichtbaren Link im Fuß erreichbar und in `robots.txt`
// gesperrt. Wer hier landet, bekommt eine harmlose Seite – und seine IP keine Formulare mehr (24 h).
import { clientIpOf, trap } from '$lib/server/bot-trap';
import type { RequestHandler } from './$types';

export const prerender = false;

const HTML =
	'<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow">' +
	'<title>Unterholz</title></head><body><p>Hier geht es nicht weiter. <a href="/">Zur Startseite</a></p></body></html>';

const handler: RequestHandler = ({ request, getClientAddress }) => {
	trap(clientIpOf(getClientAddress), request.headers.get('user-agent'));
	return new Response(request.method === 'HEAD' ? null : HTML, {
		status: 200,
		headers: {
			'content-type': 'text/html; charset=utf-8',
			'cache-control': 'no-store',
			'x-robots-tag': 'noindex, nofollow'
		}
	});
};

export const GET = handler;
export const HEAD = handler;
export const POST = handler;
