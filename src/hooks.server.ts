import { redirect, type Handle } from '@sveltejs/kit';
import { createRateLimiter } from '$lib/server/cache';
import { withSecurityHeaders } from '$lib/server/security-headers';

// Eigenes Rate-Limit je Besucher-IP (#20): Alle Besucher*innen teilen sich beim Backend den Website-API-Key –
// einzelne IPs dürfen dessen Kontingent nicht aufbrauchen. Statische Dateien (`/_app/…`, `static/`) liefert
// adapter-node vor den Hooks aus, sie zählen nicht. Hinter einem Reverse Proxy muss `ADDRESS_HEADER`
// (z. B. `X-Forwarded-For`, mit `XFF_DEPTH`) gesetzt sein, sonst teilen sich alle die IP des Proxys.
const imageLimiter = createRateLimiter({ limit: 600, windowMs: 60_000 });
const pageLimiter = createRateLimiter({ limit: 240, windowMs: 60_000 });

function clientIp(getClientAddress: () => string) {
	try {
		return getClientAddress();
	} catch {
		return 'unbekannt';
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname;
	// Die Download-Seite gibt es mit dem neuen Backend nicht mehr – alte Links landen auf der Startseite.
	if (path === '/download' || path.startsWith('/download/')) throw redirect(308, '/');

	const https = event.url.protocol === 'https:';
	const ip = clientIp(event.getClientAddress);
	const limiter = path.startsWith('/bilder/') ? imageLimiter : pageLimiter;
	const r = limiter.hit(ip);
	if (!r.allowed) {
		return withSecurityHeaders(new Response('Zu viele Anfragen – bitte versuche es gleich noch einmal.', {
			status: 429,
			headers: {
				'content-type': 'text/plain; charset=utf-8',
				'retry-after': String(r.retryAfterSec),
				'cache-control': 'no-store'
			}
		}), { https });
	}
	// Darstellung hell/dunkel: nur bei ausdrücklicher Wahl (Cookie `theme`), sonst folgt `app.html` dem System
	const choice = event.cookies.get('theme');
	const themeClass = choice === 'dark' || choice === 'light' ? choice : '';
	// Sicherheits-Header (#67, 01b-13); CSP der Seiten kommt aus kit.csp
	return withSecurityHeaders(
		await resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%ep.theme%', themeClass)
		}),
		{ https }
	);
};
