import { redirect } from '@sveltejs/kit';
import { legacyRedirectTarget } from '$lib/redirects';
import type { RequestHandler } from './$types';

/** Downloads entfallen vorerst: `/download` und Unterpfade → Startseite (308). */
export const GET: RequestHandler = ({ url }) => {
	redirect(308, legacyRedirectTarget(url.pathname, null) ?? '/');
};
