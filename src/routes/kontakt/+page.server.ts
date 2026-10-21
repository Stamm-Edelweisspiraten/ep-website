// Kontaktformular (#31): Versand über den eigenen Server per SMTP statt über formsubmit.co.
// Empfänger, Absender und Betreff stehen fest in der Konfiguration; Rate-Limit je IP und insgesamt, Honeypot.
import { fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { createRateLimiter } from '$lib/server/cache';
import { buildContactMessage, parseContactForm } from '$lib/server/contact';
import { sendMail, type SmtpConfig } from '$lib/server/smtp';
import type { Actions } from './$types';

/** je Besucher-IP höchstens 5 Nachrichten in 10 Minuten */
const perIp = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 });
/** insgesamt höchstens 30 Nachrichten je Stunde (Schutz des Postfachs und des SMTP-Kontos) */
const total = createRateLimiter({ limit: 30, windowMs: 60 * 60_000 });

function smtpConfig(): { smtp: SmtpConfig; from: string; to: string } | null {
	const host = (env.SMTP_HOST ?? '').trim();
	const from = (env.SMTP_FROM ?? '').trim();
	const to = (env.CONTACT_TO ?? '').trim();
	if (!host || !from || !to) return null;
	const port = Number(env.SMTP_PORT || 587);
	let clientName = 'localhost';
	try {
		if (env.ORIGIN) clientName = new URL(env.ORIGIN).hostname;
	} catch {
		// Standard behalten
	}
	return {
		from,
		to,
		smtp: {
			host,
			port: Number.isInteger(port) && port > 0 && port < 65536 ? port : 587,
			secure: env.SMTP_SECURE ? env.SMTP_SECURE === 'true' : port === 465,
			user: env.SMTP_USER?.trim() || undefined,
			pass: env.SMTP_PASS ?? undefined,
			clientName
		}
	};
}

const UNAVAILABLE =
	'Die Nachricht konnte gerade nicht versendet werden. Bitte versuche es später noch einmal ' +
	'oder schreib uns direkt an stafues@edelweisspiraten-bremen.de.';

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

		const parsed = parseContactForm(form);
		if (!parsed.ok) return fail(400, { error: null, errors: parsed.errors, values: parsed.values });

		const limited = perIp.hit(ip);
		if (!limited.allowed) {
			return fail(429, {
				error: 'Du hast gerade schon mehrere Nachrichten geschickt. Bitte warte ein paar Minuten.',
				errors: {},
				values: parsed.value
			});
		}
		// Honeypot: wie Erfolg antworten, aber nichts senden
		if (parsed.spam) throw redirect(303, '/kontakt?success=1#kontakt');

		const config = smtpConfig();
		if (!config || !total.hit('alle').allowed) {
			return fail(503, { error: UNAVAILABLE, errors: {}, values: parsed.value });
		}
		try {
			await sendMail(
				config.smtp,
				{ from: config.from, to: [config.to] },
				buildContactMessage(parsed.value, { from: config.from, to: config.to })
			);
		} catch (e) {
			// ohne personenbezogene Daten protokollieren
			console.error('Kontaktformular: Versand fehlgeschlagen –', (e as Error).message);
			return fail(503, { error: UNAVAILABLE, errors: {}, values: parsed.value });
		}
		throw redirect(303, '/kontakt?success=1#kontakt');
	}
};
