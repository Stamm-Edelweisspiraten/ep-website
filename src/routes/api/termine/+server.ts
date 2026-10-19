// Nächste Termine einer Gruppe für `AppointmentPreview` (früher direkt aus PocketBase im Browser).
// Läuft auf dem Server, damit der API-Key nicht in den Browser gelangt.
import { json } from '@sveltejs/kit';
import { fetchUpcomingForGroup } from '$lib/server/backend';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, setHeaders }) => {
	const slug = url.searchParams.get('gruppe') ?? '';
	if (!/^[a-z0-9-]{1,80}$/.test(slug)) return json({ group: null, appointments: [] });

	const result = await fetchUpcomingForGroup(slug).catch(() => null);
	if (!result) return json({ error: 'Termine konnten nicht geladen werden.' }, { status: 502 });

	setHeaders({ 'cache-control': 'public, max-age=60' });
	return json(result);
};
