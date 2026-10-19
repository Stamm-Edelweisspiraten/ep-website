import { describe, expect, it, vi } from 'vitest';
import { isHttpError } from '@sveltejs/kit';
import type { BinaryResult } from './intern-client';
import { InternApiError } from './intern-client';
import { cacheBytesFromEnv, createImageCache, createImageProxy } from './image-proxy';

vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('./intern', () => ({ internBinary: vi.fn() }));

const PATH = '/api/v1/modules/galleries/website/galleries/g1/images/i1/thumb';
const silent = { warn: vi.fn() };

function bytes(n: number, fill = 1) {
	return new Uint8Array(n).fill(fill);
}

function binary(data: Uint8Array, contentType = 'image/webp'): BinaryResult {
	return {
		body: new Response(data as BodyInit).body!,
		contentType,
		contentLength: String(data.byteLength)
	};
}

async function status(promise: Promise<unknown>): Promise<number> {
	try {
		await promise;
		return 200;
	} catch (err) {
		if (isHttpError(err)) return err.status;
		throw err;
	}
}

describe('createImageCache', () => {
	it('verdrängt nach Gesamtgröße die am längsten unbenutzten Einträge', () => {
		const cache = createImageCache({ maxBytes: 300, maxItemBytes: 200 });
		cache.set('a', { bytes: bytes(100), contentType: 'image/webp' });
		cache.set('b', { bytes: bytes(100), contentType: 'image/webp' });
		cache.set('c', { bytes: bytes(100), contentType: 'image/webp' });
		expect(cache.get('a')).not.toBeNull(); // a wird „frisch“
		cache.set('d', { bytes: bytes(100), contentType: 'image/webp' });
		expect(cache.get('b')).toBeNull();
		expect(cache.get('a')).not.toBeNull();
		expect(cache.get('c')).not.toBeNull();
		expect(cache.size).toBe(300);
		expect(cache.count).toBe(3);
	});

	it('speichert keine zu großen Bilder und nichts bei Größe 0', () => {
		const cache = createImageCache({ maxBytes: 1000, maxItemBytes: 100 });
		expect(cache.set('x', { bytes: bytes(101), contentType: 'image/png' })).toBe(false);
		expect(cache.set('y', { bytes: bytes(100), contentType: 'image/png' })).toBe(true);
		const off = createImageCache({ maxBytes: 0 });
		expect(off.set('z', { bytes: bytes(1), contentType: 'image/png' })).toBe(false);
		expect(off.count).toBe(0);
	});

	it('läuft nach der TTL ab und ersetzt gleiche Schlüssel ohne Doppelzählung', () => {
		let time = 0;
		const cache = createImageCache({ maxBytes: 1000, ttlMs: 1000, now: () => time });
		cache.set('a', { bytes: bytes(10), contentType: 'image/png' });
		cache.set('a', { bytes: bytes(20), contentType: 'image/png' });
		expect(cache.size).toBe(20);
		time = 999;
		expect(cache.get('a')).not.toBeNull();
		time = 1000;
		expect(cache.get('a')).toBeNull();
		expect(cache.size).toBe(0);
	});
});

describe('createImageProxy', () => {
	function setup(impl: () => Promise<BinaryResult | null>) {
		const fetchBinary = vi.fn(impl);
		const proxy = createImageProxy({
			fetchBinary,
			cache: createImageCache({ maxBytes: 10_000, maxItemBytes: 1000 }),
			logger: silent
		});
		return { fetchBinary, proxy };
	}

	it('liefert das Bild und beim zweiten Mal aus dem Cache', async () => {
		const { fetchBinary, proxy } = setup(async () => binary(bytes(50, 7)));
		const first = await proxy.proxyImage(PATH);
		expect(first.status).toBe(200);
		expect(first.headers.get('content-type')).toBe('image/webp');
		expect(first.headers.get('x-content-type-options')).toBe('nosniff');
		expect(first.headers.get('x-cache')).toBe('MISS');
		expect(new Uint8Array(await first.arrayBuffer())).toEqual(bytes(50, 7));

		const second = await proxy.proxyImage(PATH);
		expect(second.headers.get('x-cache')).toBe('HIT');
		expect(second.headers.get('content-length')).toBe('50');
		expect((await second.arrayBuffer()).byteLength).toBe(50);
		expect(fetchBinary).toHaveBeenCalledTimes(1);
	});

	it('legt gleichzeitige Anfragen zusammen', async () => {
		let resolve!: (value: BinaryResult) => void;
		const { fetchBinary, proxy } = setup(() => new Promise<BinaryResult>((r) => (resolve = r)));
		const a = proxy.proxyImage(PATH);
		const b = proxy.proxyImage(PATH);
		resolve(binary(bytes(10)));
		const [ra, rb] = await Promise.all([a, b]);
		expect(ra.status).toBe(200);
		expect(rb.status).toBe(200);
		expect((await rb.arrayBuffer()).byteLength).toBe(10);
		expect(fetchBinary).toHaveBeenCalledTimes(1);
	});

	it('unterscheidet Query-Werte (Cache-Busting mit ?v=)', async () => {
		const { fetchBinary, proxy } = setup(async () => binary(bytes(5)));
		await proxy.proxyImage(PATH, { v: '1' });
		await proxy.proxyImage(PATH, { v: '2' });
		await proxy.proxyImage(PATH, { v: '1' });
		expect(fetchBinary).toHaveBeenCalledTimes(2);
	});

	it('cacht große Bilder nicht, liefert sie aber aus', async () => {
		const { fetchBinary, proxy } = setup(async () => binary(bytes(2000)));
		expect((await (await proxy.proxyImage(PATH)).arrayBuffer()).byteLength).toBe(2000);
		await proxy.proxyImage(PATH);
		expect(fetchBinary).toHaveBeenCalledTimes(2);
	});

	it('404 bleibt 404 und wird nicht gecacht', async () => {
		const { fetchBinary, proxy } = setup(async () => null);
		expect(await status(proxy.proxyImage(PATH))).toBe(404);
		expect(await status(proxy.proxyImage(PATH))).toBe(404);
		expect(fetchBinary).toHaveBeenCalledTimes(2);
	});

	it('Fehler der API → 502/503, danach neuer Versuch', async () => {
		let fail = true;
		const { fetchBinary, proxy } = setup(async () => {
			if (fail) throw new InternApiError(503, 'aus', PATH, 'not_configured');
			return binary(bytes(3));
		});
		expect(await status(proxy.proxyImage(PATH))).toBe(503);
		fail = false;
		expect(await status(proxy.proxyImage(PATH))).toBe(200);
		expect(fetchBinary).toHaveBeenCalledTimes(2);
	});

	it('lehnt fremde Inhaltstypen ab', async () => {
		const { proxy } = setup(async () => binary(bytes(3), 'text/html'));
		expect(await status(proxy.proxyImage(PATH))).toBe(502);
	});

	it('bricht zu große Antworten ab', async () => {
		const proxy = createImageProxy({
			fetchBinary: async () => binary(bytes(200)),
			cache: createImageCache(),
			maxReadBytes: 100,
			logger: silent
		});
		expect(await status(proxy.proxyImage(PATH))).toBe(502);
	});
});

describe('cacheBytesFromEnv', () => {
	it('liest MB, 0 schaltet ab, Unsinn → Standard', () => {
		expect(cacheBytesFromEnv(undefined)).toBe(100 * 1024 * 1024);
		expect(cacheBytesFromEnv('')).toBe(100 * 1024 * 1024);
		expect(cacheBytesFromEnv('20')).toBe(20 * 1024 * 1024);
		expect(cacheBytesFromEnv('0')).toBe(0);
		expect(cacheBytesFromEnv('-5')).toBe(100 * 1024 * 1024);
		expect(cacheBytesFromEnv('viel')).toBe(100 * 1024 * 1024);
	});
});
