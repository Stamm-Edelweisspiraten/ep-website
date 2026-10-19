import { redirect } from '@sveltejs/kit';
import { legacyRedirectTarget } from '$lib/redirects';
import { listGroups, safe } from '$lib/server/intern';
import type { RequestHandler } from './$types';

/** Alte Gruppenseite → `/gruppen/<slug>` (308); steht die Gruppe nicht auf der Website → `/gruppen`. */
export const GET: RequestHandler = async ({ url }) => {
	const groups = await safe(listGroups(), []);
	const slugs = groups.error ? null : groups.value.map((g) => g.slug);
	redirect(308, legacyRedirectTarget(url.pathname, slugs) ?? '/gruppen');
};
