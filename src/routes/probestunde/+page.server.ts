// Probestunde anfragen: Die Anfrage geht serverseitig an den Intern-Bereich und landet im Posteingang der
// passenden Gruppe (gewählte Gruppe, sonst nach Alter; `messages`-Endpunkt `website/trial`), sonst im Stamm-Postfach.
// Spam-Schutz wie beim Kontaktformular: Honeypot, Rate-Limit je IP und insgesamt, Proof-of-Work + Zeitfalle
// (`ContactGuard.svelte`, Aufgabe von `/kontakt/challenge`), CSRF über `ORIGIN`.
// Rückfall bei Ausfall des Backends: Versand per SMTP an die feste Kontaktadresse (wie `/kontakt`), falls konfiguriert.
import { fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { BackendError, fetchGroups, submitTrial } from '$lib/server/backend';
import { createRateLimiter } from '$lib/server/cache';
import {
	buildContactMessage,
	parsePow,
	parseTrialForm,
	trialAsContact,
	type ContactInput
} from '$lib/server/contact';
import { sendMail } from '$lib/server/smtp';
import type { Actions } from './$types';

/** je Besucher-IP höchstens 5 Anfragen in 10 Minuten */
const perIp = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 });
/** insgesamt höchstens 30 Anfragen je Stunde */
const total = createRateLimiter({ limit: 30, windowMs: 60 * 60_000 });

const FALLBACK_MAIL = 'stafues@edelweisspiraten-bremen.de';
const UNAVAILABLE =
	'Die Anfrage konnte gerade nicht versendet werden. Bitte versuche es später noch einmal ' +
	`oder schreib uns direkt an ${FALLBACK_MAIL}.`;
const POW_MISSING =
	'Der Spam-Schutz ist noch nicht fertig (dafür braucht es JavaScript). Bitte warte einen Moment und sende erneut ' +
	`– oder schreib uns direkt an ${FALLBACK_MAIL}.`;

/** Rückfall per SMTP (gleiche Konfiguration wie `/kontakt`); `false`, wenn nicht konfiguriert oder fehlgeschlagen */
async function sendBySmtp(value: ContactInput): Promise<boolean> {
	const host = (env.SMTP_HOST ?? '').trim();
	const from = (env.SMTP_FROM ?? '').trim();
	const to = (env.CONTACT_TO ?? '').trim();
	if (!host || !from || !to) return false;
	const port = Number(env.SMTP_PORT || 587);
	let clientName = 'localhost';
	try {
		if (env.ORIGIN) clientName = new URL(env.ORIGIN).hostname;
	} catch {
		// Standard behalten
	}
	try {
		await sendMail(
			{
				host,
				port: Number.isInteger(port) && port > 0 && port < 65536 ? port : 587,
				secure: env.SMTP_SECURE ? env.SMTP_SECURE === 'true' : port === 465,
				user: env.SMTP_USER?.trim() || undefined,
				pass: env.SMTP_PASS ?? undefined,
				clientName
			},
			{ from, to: [to] },
			buildContactMessage(value, { from, to })
		);
		return true;
	} catch (e) {
		// ohne personenbezogene Daten protokollieren
		console.error('Probestunde: SMTP-Versand fehlgeschlagen –', (e as Error).message);
		return false;
	}
}

function done(slug: string | null): never {
	throw redirect(303, `/probestunde?success=1${slug ? `&gruppe=${encodeURIComponent(slug)}` : ''}`);
}

export const actions: Actions = {
	default: async ({ request, getClientAddress }) => {
		let ip = 'unbekannt';
		try {
			ip = getClientAddress();
		} catch {
			// ohne IP gemeinsam zählen
		}
		const form = await request.formData().catch(() => null);
		if (!form) return fail(400, { error: 'Ungültige Anfrage.', errors: {}, values: null });

		const groups = await fetchGroups().catch(() => []);
		const parsed = parseTrialForm(
			form,
			groups.map((g) => g.slug)
		);
		if (!parsed.ok) return fail(400, { error: null, errors: parsed.errors, values: parsed.values });

		if (!perIp.hit(ip).allowed) {
			return fail(429, {
				error: 'Du hast gerade schon mehrere Anfragen geschickt. Bitte warte ein paar Minuten.',
				errors: {},
				values: parsed.value
			});
		}
		// Honeypot: wie Erfolg antworten, aber nichts senden
		if (parsed.spam) done(null);

		const pow = parsePow(form);
		if (!pow) return fail(400, { error: POW_MISSING, errors: {}, values: parsed.value });
		if (!total.hit('alle').allowed) {
			return fail(503, { error: UNAVAILABLE, errors: {}, values: parsed.value });
		}

		let slug: string | null = parsed.value.groupSlug || null;
		try {
			slug = (await submitTrial({ ...parsed.value, pow })) ?? slug;
		} catch (e) {
			const status = e instanceof BackendError ? e.status : 503;
			if (status === 422 || status === 400) {
				return fail(400, {
					error: (e as Error).message || UNAVAILABLE,
					errors: {},
					values: parsed.value
				});
			}
			const chosen = groups.find((g) => g.slug === parsed.value.groupSlug);
			const label = chosen ? `${chosen.typeLabel} ${chosen.name}` : null;
			if (!(await sendBySmtp(trialAsContact(parsed.value, label)))) {
				return fail(503, { error: UNAVAILABLE, errors: {}, values: parsed.value });
			}
		}
		done(slug);
	}
};
