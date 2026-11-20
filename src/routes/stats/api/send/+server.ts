// Ereignisse des Umami-Trackers serverseitig an die Umami-Instanz weiterreichen (siehe `lib/server/umami.ts`).
// Nur Ereignisse unserer Website-ID; IP der Besucherin / des Besuchers geht als `X-Forwarded-For` mit, damit Umami
// Besuche unterscheiden kann (Umami speichert keine IP, nur einen täglich wechselnden Hash).
import { clientIpOf, isTrapped } from '$lib/server/bot-trap';
import { isOwnEvent, umamiConfig } from '$lib/server/umami';
import type { RequestHandler } from './$types';

const noStore = { 'cache-control': 'no-store' };

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const config = umamiConfig();
	if (!config) return new Response(null, { status: 404, headers: noStore });

	const ip = clientIpOf(getClientAddress);
	// Gesperrte Bots (Falle) nicht mitzählen
	if (isTrapped(ip)) return new Response(null, { status: 204, headers: noStore });

	const body = await request.text();
	if (!isOwnEvent(body, config.websiteId)) return new Response(null, { status: 400, headers: noStore });

	const headers: Record<string, string> = {
		'content-type': 'application/json',
		'user-agent': request.headers.get('user-agent') ?? ''
	};
	if (ip && ip !== 'unbekannt') headers['x-forwarded-for'] = ip;
	const cache = request.headers.get('x-umami-cache');
	if (cache && cache.length < 2048) headers['x-umami-cache'] = cache;

	try {
		const res = await fetch(`${config.url}/api/send`, {
			method: 'POST',
			headers,
			body,
			signal: AbortSignal.timeout(4000)
		});
		return new Response(await res.text(), {
			status: res.status,
			headers: { 'content-type': res.headers.get('content-type') ?? 'application/json', ...noStore }
		});
	} catch (err) {
		console.warn(`[umami] api/send: ${err instanceof Error ? err.message : err}`);
		return new Response(null, { status: 502, headers: noStore });
	}
};
