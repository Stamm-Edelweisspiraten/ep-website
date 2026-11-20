// Gemeinsame Weiterleitung zur Umami-Instanz (siehe `lib/server/umami.ts`) für die Routen unter `/stats/`.
import { clientIpOf, isTrapped } from '$lib/server/bot-trap';
import { umamiConfig } from '$lib/server/umami';

const SCRIPT_TTL_MS = 6 * 60 * 60_000;
const noStore = { 'cache-control': 'no-store' };

const js = (body: string, maxAge: number) =>
	new Response(body, {
		headers: {
			'content-type': 'application/javascript; charset=utf-8',
			'cache-control': `public, max-age=${maxAge}`,
			'x-content-type-options': 'nosniff'
		}
	});

/**
 * Skript der Umami-Instanz (`script.js`, `recorder.js`) über die eigene Domain. 6 h im Speicher; ist Umami gerade
 * nicht erreichbar, gibt es den letzten Stand oder ein leeres Skript (Seite funktioniert weiter).
 */
export function scriptProxy(file: string): () => Promise<Response> {
	let cached: { body: string; at: number; url: string } | null = null;
	return async () => {
		const config = umamiConfig();
		if (!config) return new Response('Not found', { status: 404 });
		if (cached && cached.url === config.url && Date.now() - cached.at < SCRIPT_TTL_MS) return js(cached.body, 3600);
		try {
			const res = await fetch(`${config.url}/${file}`, { signal: AbortSignal.timeout(4000) });
			const type = res.headers.get('content-type') ?? '';
			if (!res.ok || !/javascript/i.test(type)) throw new Error(`HTTP ${res.status} ${type}`);
			const body = await res.text();
			cached = { body, at: Date.now(), url: config.url };
			return js(body, 3600);
		} catch (err) {
			console.warn(`[umami] ${file}: ${err instanceof Error ? err.message : err}`);
			if (cached && cached.url === config.url) return js(cached.body, 300);
			return js('', 60);
		}
	};
}

/**
 * POST an die Umami-Instanz weiterreichen, wenn `accept(body, websiteId)` zustimmt (nur eigene Website-ID).
 * IP geht als `X-Forwarded-For` mit (Umami speichert keine IP, nur einen täglich wechselnden Hash); Bots aus der Falle → 204.
 */
export async function forwardPost(
	request: Request,
	getClientAddress: () => string,
	path: string,
	accept: (body: string, websiteId: string) => boolean
): Promise<Response> {
	const config = umamiConfig();
	if (!config) return new Response(null, { status: 404, headers: noStore });

	const ip = clientIpOf(getClientAddress);
	if (isTrapped(ip)) return new Response(null, { status: 204, headers: noStore });

	const body = await request.text();
	if (!accept(body, config.websiteId)) return new Response(null, { status: 400, headers: noStore });

	const headers: Record<string, string> = {
		'content-type': 'application/json',
		'user-agent': request.headers.get('user-agent') ?? ''
	};
	if (ip && ip !== 'unbekannt') headers['x-forwarded-for'] = ip;
	const cache = request.headers.get('x-umami-cache');
	if (cache && cache.length < 2048) headers['x-umami-cache'] = cache;

	try {
		const res = await fetch(`${config.url}${path}`, {
			method: 'POST',
			headers,
			body,
			signal: AbortSignal.timeout(path === '/api/record' ? 10_000 : 4000)
		});
		return new Response(await res.text(), {
			status: res.status,
			headers: { 'content-type': res.headers.get('content-type') ?? 'application/json', ...noStore }
		});
	} catch (err) {
		console.warn(`[umami] ${path}: ${err instanceof Error ? err.message : err}`);
		return new Response(null, { status: 502, headers: noStore });
	}
}

/** Einstellungen des Recorders (Aufzeichnung/Heatmap an, Stichprobe, Maskierung) – nur für unsere Website-ID, 5 min gemerkt. */
let recorderSettings: { body: string; at: number; key: string } | null = null;
export async function recorderSettingsProxy(id: string): Promise<Response> {
	const config = umamiConfig();
	if (!config || id.toLowerCase() !== config.websiteId) return new Response(null, { status: 404, headers: noStore });
	const key = `${config.url}|${config.websiteId}`;
	const ok = (body: string) =>
		new Response(body, { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' } });
	if (recorderSettings && recorderSettings.key === key && Date.now() - recorderSettings.at < 5 * 60_000) {
		return ok(recorderSettings.body);
	}
	try {
		const res = await fetch(`${config.url}/api/websites/${config.websiteId}/recorder`, {
			signal: AbortSignal.timeout(4000)
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const body = await res.text();
		JSON.parse(body); // nur gültiges JSON weitergeben
		recorderSettings = { body, at: Date.now(), key };
		return ok(body);
	} catch (err) {
		console.warn(`[umami] recorder settings: ${err instanceof Error ? err.message : err}`);
		// ohne Einstellungen zeichnet der Recorder nichts auf
		return new Response(null, { status: 503, headers: noStore });
	}
}
