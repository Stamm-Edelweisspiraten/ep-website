/**
 * Gzip für dynamische Antworten (HTML-Seiten, JSON, XML, Text). Statische Dateien liefert adapter-node schon
 * vorkomprimiert aus (`precompress`), sie erreichen die Hooks nicht. Rein (nur Web-APIs), getestet in
 * `tests/unit/website-seo.test.ts`. Abschaltbar mit `COMPRESS=0` (z. B. wenn der Reverse Proxy komprimiert).
 */

const COMPRESSIBLE =
	/^(text\/|application\/(json|xml|rss\+xml|atom\+xml|javascript|ld\+json|manifest\+json)|image\/svg\+xml)/i;
/** kleinere Antworten lohnen den Aufwand nicht (nur wenn die Länge bekannt ist) */
export const MIN_COMPRESS_BYTES = 1024;

/** `gzip` erlaubt? (`gzip;q=0` = ausdrücklich nicht) */
export function acceptsGzip(acceptEncoding: string | null): boolean {
	if (!acceptEncoding) return false;
	return acceptEncoding.split(',').some((part) => {
		const [name, ...params] = part.trim().toLowerCase().split(';');
		if (name?.trim() !== 'gzip' && name?.trim() !== '*') return false;
		const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
		return !q || Number(q.slice(2)) > 0;
	});
}

export function shouldCompress(request: Request, response: Response): boolean {
	if (request.method === 'HEAD' || !response.body) return false;
	if (
		response.status < 200 ||
		response.status === 204 ||
		response.status === 206 ||
		response.status === 304
	) {
		return false;
	}
	if (!acceptsGzip(request.headers.get('accept-encoding'))) return false;
	const h = response.headers;
	if (h.has('content-encoding')) return false;
	if (/\bno-transform\b/i.test(h.get('cache-control') ?? '')) return false;
	const type = h.get('content-type') ?? '';
	if (!COMPRESSIBLE.test(type) || /text\/event-stream/i.test(type)) return false;
	const length = h.get('content-length');
	if (length !== null && Number(length) < MIN_COMPRESS_BYTES) return false;
	return typeof CompressionStream === 'function';
}

/** Neue Antwort mit gzip-Körper (die Header von SvelteKit-Antworten können unveränderlich sein → Kopie). */
export function compressResponse(request: Request, response: Response): Response {
	if (!shouldCompress(request, response)) return response;
	const headers = new Headers(response.headers);
	headers.set('content-encoding', 'gzip');
	headers.delete('content-length');
	const vary = headers.get('vary');
	if (!vary) headers.set('vary', 'accept-encoding');
	else if (!/(^|,)\s*(accept-encoding|\*)\s*(,|$)/i.test(vary))
		headers.set('vary', `${vary}, accept-encoding`);
	// starke ETags gelten nur für die unkomprimierte Fassung
	const etag = headers.get('etag');
	if (etag && !etag.startsWith('W/')) headers.set('etag', `W/${etag}`);
	return new Response(response.body!.pipeThrough(new CompressionStream('gzip')), {
		status: response.status,
		statusText: response.statusText,
		headers
	});
}
