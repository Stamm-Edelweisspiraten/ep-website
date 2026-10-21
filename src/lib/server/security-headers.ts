/**
 * Sicherheits-Header der Stammeswebsite (#67, 01b-13). Die CSP selbst kommt aus `svelte.config.js`
 * (`kit.csp`, mit Nonces); hier ergänzen wir die übrigen Header und – für Antworten ohne CSP (z. B. der
 * Bild-Proxy oder Fehlerseiten) – eine Minimal-CSP gegen Einbetten in fremde Seiten (Clickjacking).
 */
export const FALLBACK_CSP = "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'";

export function applySecurityHeaders(headers: Headers, opts: { https: boolean }): void {
	const set = (name: string, value: string) => {
		if (!headers.has(name)) headers.set(name, value);
	};
	set('x-frame-options', 'DENY');
	set('x-content-type-options', 'nosniff');
	set('referrer-policy', 'strict-origin-when-cross-origin');
	set('permissions-policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
	set('cross-origin-opener-policy', 'same-origin');
	set('content-security-policy', FALLBACK_CSP);
	// HSTS nur über HTTPS (hinter dem Reverse Proxy: ORIGIN=https://… setzen)
	if (opts.https) set('strict-transport-security', 'max-age=31536000; includeSubDomains');
}

/** Header auf eine Antwort anwenden; unveränderliche Header (z. B. durchgereichte `fetch`-Antworten) → Kopie. */
export function withSecurityHeaders(response: Response, opts: { https: boolean }): Response {
	try {
		applySecurityHeaders(response.headers, opts);
		return response;
	} catch {
		const copy = new Response(response.body, response);
		applySecurityHeaders(copy.headers, opts);
		return copy;
	}
}
