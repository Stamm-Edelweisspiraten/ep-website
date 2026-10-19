import { describe, expect, it, vi } from 'vitest';
import { buildPath, createInternClient, InternApiError, orNull, safe } from './intern-client';

const EVENTS = '/api/v1/modules/events/website/events';
const silent = { warn: vi.fn(), error: vi.fn() };

function json(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json' }
	});
}

function setup(fetchImpl: (url: string, init?: RequestInit) => Promise<Response>) {
	let time = 1_000_000;
	const fetchMock = vi.fn(fetchImpl);
	const client = createInternClient({
		baseUrl: 'http://intern:3000/',
		apiKey: 'epk_test',
		fetch: fetchMock as unknown as typeof fetch,
		ttlMs: 60_000,
		now: () => time,
		logger: silent
	});
	return {
		client,
		fetchMock,
		advance: (ms: number) => {
			time += ms;
		}
	};
}

describe('buildPath', () => {
	it('sortiert Query und lässt leere Werte weg', () => {
		expect(buildPath(EVENTS, { to: '2026-12-31', from: '2026-01-01', tag: '', group: null })).toBe(
			`${EVENTS}?from=2026-01-01&to=2026-12-31`
		);
	});
	it('erlaubt nur Website-Endpunkte', () => {
		expect(() => buildPath('/api/v1/modules/members/members')).toThrow(InternApiError);
		expect(() => buildPath('/api/v1/modules/events/website/../members')).toThrow(InternApiError);
	});
});

describe('internJson', () => {
	it('entpackt { data } und sendet den Key', async () => {
		const { client, fetchMock } = setup(async () => json({ data: [{ id: 'e1' }] }));
		await expect(client.internJson(EVENTS, { limit: 5 })).resolves.toEqual([{ id: 'e1' }]);
		const [url, init] = fetchMock.mock.calls[0]!;
		expect(url).toBe(`http://intern:3000${EVENTS}?limit=5`);
		expect(new Headers(init?.headers).get('authorization')).toBe('Bearer epk_test');
	});

	it('cacht innerhalb der TTL und lädt danach neu', async () => {
		let n = 0;
		const { client, fetchMock, advance } = setup(async () => json({ data: ++n }));
		expect(await client.internJson(EVENTS)).toBe(1);
		expect(await client.internJson(EVENTS)).toBe(1);
		expect(fetchMock).toHaveBeenCalledTimes(1);
		advance(60_001);
		expect(await client.internJson(EVENTS)).toBe(2);
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it('legt gleichzeitige Anfragen zusammen', async () => {
		let resolve!: (r: Response) => void;
		const { client, fetchMock } = setup(() => new Promise<Response>((r) => (resolve = r)));
		const a = client.internJson(EVENTS);
		const b = client.internJson(EVENTS);
		resolve(json({ data: 'x' }));
		expect(await Promise.all([a, b])).toEqual(['x', 'x']);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('liefert bei Fehler den letzten guten Wert (Stale-on-Error)', async () => {
		let fail = false;
		const { client, advance } = setup(async () =>
			fail ? json({ error: { code: 'internal', message: 'kaputt' } }, 500) : json({ data: 'gut' })
		);
		expect(await client.internJson(EVENTS)).toBe('gut');
		fail = true;
		advance(120_000);
		expect(await client.internJson(EVENTS)).toBe('gut');
	});

	it('Stale-on-Error auch bei Netzwerkfehlern', async () => {
		let fail = false;
		const { client, advance } = setup(async () => {
			if (fail) throw new TypeError('fetch failed');
			return json({ data: 1 });
		});
		await client.internJson(EVENTS);
		fail = true;
		advance(120_000);
		expect(await client.internJson(EVENTS)).toBe(1);
	});

	it('wirft ohne Cache mit Status und Code', async () => {
		const { client } = setup(async () =>
			json({ error: { code: 'rate_limited', message: 'Zu viele' } }, 429)
		);
		const err = await client.internJson(EVENTS).catch((e: unknown) => e);
		expect(err).toBeInstanceOf(InternApiError);
		expect((err as InternApiError).status).toBe(429);
		expect((err as InternApiError).code).toBe('rate_limited');
	});

	it('Netzwerkfehler → 502', async () => {
		const { client } = setup(async () => {
			throw new TypeError('fetch failed');
		});
		await expect(client.internJson(EVENTS)).rejects.toMatchObject({ status: 502 });
	});

	it('404 verwirft den Cache und liefert keinen alten Stand', async () => {
		let gone = false;
		const { client, advance } = setup(async () =>
			gone ? json({ error: { code: 'not_found', message: 'weg' } }, 404) : json({ data: 'x' })
		);
		await client.internJson(`${EVENTS}/e1`);
		gone = true;
		advance(120_000);
		await expect(orNull(client.internJson(`${EVENTS}/e1`))).resolves.toBeNull();
	});

	it('ttlMs 0 cacht nicht', async () => {
		const { client, fetchMock } = setup(async () => json({ data: 1 }));
		await client.internJson(EVENTS, undefined, { ttlMs: 0 });
		await client.internJson(EVENTS, undefined, { ttlMs: 0 });
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it('fehlende Konfiguration → 503 not_configured, ohne Abruf', async () => {
		const fetchMock = vi.fn();
		const client = createInternClient({
			baseUrl: '',
			apiKey: undefined,
			fetch: fetchMock as unknown as typeof fetch,
			logger: silent
		});
		expect(client.configured).toBe(false);
		await expect(client.internJson(EVENTS)).rejects.toMatchObject({
			status: 503,
			code: 'not_configured'
		});
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('Antwort ohne data → 502', async () => {
		const { client } = setup(async () => json({ foo: 1 }));
		await expect(client.internJson(EVENTS)).rejects.toMatchObject({ status: 502 });
	});
});

describe('internBinary', () => {
	const IMG = '/api/v1/modules/galleries/website/galleries/g/images/i/thumb';

	it('reicht Stream und Content-Type durch', async () => {
		const { client } = setup(
			async () =>
				new Response(new Uint8Array([1, 2, 3]), { headers: { 'content-type': 'image/webp' } })
		);
		const result = await client.internBinary(IMG);
		expect(result?.contentType).toBe('image/webp');
		expect(new Uint8Array(await new Response(result!.body).arrayBuffer())).toEqual(
			new Uint8Array([1, 2, 3])
		);
	});

	it('merkt 404 kurz', async () => {
		const { client, fetchMock, advance } = setup(async () => json({ error: {} }, 404));
		expect(await client.internBinary(IMG)).toBeNull();
		expect(await client.internBinary(IMG)).toBeNull();
		expect(fetchMock).toHaveBeenCalledTimes(1);
		advance(60_001);
		await client.internBinary(IMG);
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});
});

describe('safe / orNull', () => {
	it('safe liefert Ersatzwert und error', async () => {
		await expect(safe(Promise.resolve(1), 0, silent)).resolves.toEqual({ value: 1, error: false });
		await expect(
			safe(Promise.reject(new InternApiError(500, 'x', EVENTS)), [], silent)
		).resolves.toEqual({ value: [], error: true });
	});

	it('orNull: module_disabled ist ein Fehler, kein „nicht gefunden“', async () => {
		await expect(orNull(Promise.reject(new InternApiError(404, 'x', EVENTS)))).resolves.toBeNull();
		await expect(
			orNull(Promise.reject(new InternApiError(404, 'x', EVENTS, 'module_disabled')))
		).rejects.toBeInstanceOf(InternApiError);
	});
});
