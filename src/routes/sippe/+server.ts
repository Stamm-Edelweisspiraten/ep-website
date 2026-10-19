import { redirect } from '@sveltejs/kit';
import { legacyRedirectTarget } from '$lib/redirects';
import type { RequestHandler } from './$types';

/** Alte Sippen-Übersicht → `/gruppen` (308). */
export const GET: RequestHandler = ({ url }) => {
	redirect(308, legacyRedirectTarget(url.pathname, null) ?? '/gruppen');
};
