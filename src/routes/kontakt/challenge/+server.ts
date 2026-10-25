// Spam-Schutz-Aufgabe (Proof-of-Work) für das Kontaktformular: der Browser holt sie hier ab, die Website fragt
// das Backend mit ihrem API-Key (der Key gelangt nie in den Browser). Nie zwischenspeichern – jede Aufgabe gilt einmal.
import { json } from '@sveltejs/kit';
import { fetchContactChallenge } from '$lib/server/backend';
import { createRateLimiter } from '$lib/server/cache';
import type { RequestHandler } from './$types';

/** je Besucher-IP höchstens 30 Aufgaben in 10 Minuten (Seitenaufrufe mit Formular) */
const perIp = createRateLimiter({ limit: 30, windowMs: 10 * 60_000 });

const NO_STORE = { 'cache-control': 'no-store', 'x-robots-tag': 'noindex' };

export const GET: RequestHandler = async ({ getClientAddress }) => {
	let ip = 'unbekannt';
	try {
		ip = getClientAddress();
	} catch {
		// ohne IP gemeinsam zählen
	}
	const limited = perIp.hit(ip);
	if (!limited.allowed) {
		return json({ error: 'Zu viele Anfragen' }, { status: 429, headers: NO_STORE });
	}
	try {
		const c = await fetchContactChallenge();
		return json(
			{
				algorithm: c.algorithm,
				salt: c.salt,
				challenge: c.challenge,
				maxNumber: c.maxNumber,
				signature: c.signature,
				expiresAt: c.expiresAt
			},
			{ headers: NO_STORE }
		);
	} catch {
		// Ursache steht schon im Log (`backend.ts`)
		return json({ error: 'Gerade nicht verfügbar' }, { status: 503, headers: NO_STORE });
	}
};
