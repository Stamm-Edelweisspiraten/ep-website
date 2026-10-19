import type { Handle } from '@sveltejs/kit';

/** Zusätzliche Sicherheits-Header (CSP setzt SvelteKit, siehe svelte.config.js). */
export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	const headers = response.headers;
	if (!headers.has('x-content-type-options')) headers.set('x-content-type-options', 'nosniff');
	headers.set('referrer-policy', 'strict-origin-when-cross-origin');
	headers.set('x-frame-options', 'DENY');
	headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()');
	return response;
};
