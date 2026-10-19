import { listEvents, safe } from '$lib/server/intern';
import {
	addDays,
	eventKey,
	parseReviewYear,
	reviewRange,
	reviewYears,
	sortEvents,
	splitRange
} from '$lib/events';
import { todayIso } from '$lib/format';
import type { WebsiteEvent } from '$lib/server/types';
import type { PageServerLoad } from './$types';

/** Höchstzahl je API-Abruf */
const LIMIT = 200;

/**
 * Kommende Termine (heute bis in einem Jahr) bzw. ein Rückblick-Jahr (`?rueckblick=JJJJ`).
 * Abruf in Quartals-Blöcken (je ≤ 200 Termine, gecacht), damit wöchentliche Serien spätere
 * Einzeltermine nicht verdrängen. Tag-/Gruppenfilter und das Zusammenfassen der Serien
 * (`?tag=`, `?gruppe=`, `?serien=alle`) wertet die Seite aus – ohne weitere Abrufe.
 */
export const load: PageServerLoad = async ({ url }) => {
	const today = todayIso();
	const review = parseReviewYear(url.searchParams.get('rueckblick'), today);
	const range = review ? reviewRange(review, today) : { from: today, to: addDays(today, 365) };
	const chunks = range ? splitRange(range.from, range.to) : [];

	const results = await Promise.all(
		chunks.map((chunk) => safe(listEvents({ ...chunk, limit: LIMIT }), [] as WebsiteEvent[]))
	);
	const byKey = new Map<string, WebsiteEvent>();
	for (const result of results) {
		for (const event of result.value) {
			// Rückblick: nur Termine, die im Jahr beginnen (die API liefert auch solche, die hineinragen)
			if (range && review && event.startsOn < range.from) continue;
			byKey.set(eventKey(event), event);
		}
	}

	return {
		events: sortEvents([...byKey.values()], review ? 'desc' : 'asc'),
		/** Fehler nur melden, wenn gar nichts kam – sonst Teilstand zeigen */
		eventsError: results.length > 0 && results.every((r) => r.error),
		partialError: results.some((r) => r.error) && !results.every((r) => r.error),
		review,
		years: reviewYears(today),
		/** Ein Block hat die API-Grenze erreicht – es könnten Termine fehlen */
		truncated: results.some((r) => r.value.length >= LIMIT)
	};
};
