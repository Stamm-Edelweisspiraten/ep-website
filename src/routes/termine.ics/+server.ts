// Kalender-Abo (iCalendar): `/termine.ics` = alle besonderen Termine (ohne wöchentliche Gruppenstunden),
// `/termine.ics?gruppe=<slug>` = alle Termine einer Gruppe inkl. Gruppenstunden. Zeitraum: 90 Tage zurück bis
// Ende nächsten Jahres (Umfang von `fetchEvents`). Kalender-Apps fragen alle paar Stunden neu ab.
import { error } from '@sveltejs/kit';
import { fetchEvents, fetchGroups } from '$lib/server/backend';
import { buildCalendar } from '$lib/server/ical';
import { siteBase } from '$lib/server/site-url';
import { todayBerlin } from '$lib/dates';
import type { RequestHandler } from './$types';

export const prerender = false;

const SLUG_RE = /^[a-z0-9-]{1,80}$/;

function daysAgo(today: string, days: number): string {
	const d = new Date(`${today}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() - days);
	return d.toISOString().slice(0, 10);
}

export const GET: RequestHandler = async ({ url }) => {
	const slug = url.searchParams.get('gruppe');
	if (slug !== null && !SLUG_RE.test(slug)) throw error(404, 'Unbekannte Gruppe');

	const [events, groups] = await Promise.all([
		fetchEvents().catch(() => {
			throw error(503, 'Termine konnten gerade nicht geladen werden');
		}),
		slug ? fetchGroups().catch(() => []) : Promise.resolve([])
	]);

	const group = slug ? groups.find((g) => g.slug === slug) : null;
	if (slug && !group) throw error(404, 'Unbekannte Gruppe');

	const from = daysAgo(todayBerlin(), 90);
	const selected = events.filter((e) => {
		if ((e.endsOn ?? e.startsOn) < from) return false;
		if (group) return e.groups.some((g) => g.href === group.href);
		return !e.recurring;
	});

	const name = group ? `${group.name} – Edelweißpiraten` : 'Termine – Stamm Edelweißpiraten';
	const body = buildCalendar({
		events: selected,
		base: siteBase(url),
		name,
		description: group
			? `Termine und Gruppenstunden der ${group.typeLabel} ${group.name} (Pfadfinder Edelweißpiraten, Bremen-Hastedt)`
			: 'Fahrten, Lager und Aktionen der Pfadfinder vom Stamm Edelweißpiraten in Bremen-Hastedt'
	});

	return new Response(body, {
		headers: {
			'content-type': 'text/calendar; charset=utf-8',
			'content-disposition': `inline; filename="${slug ? `edelweisspiraten-${slug}` : 'edelweisspiraten'}.ics"`,
			'cache-control': 'public, max-age=900'
		}
	});
};
