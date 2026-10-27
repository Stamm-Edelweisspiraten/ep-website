// Kontaktformular: Die Anfrage geht serverseitig an den Intern-Bereich und landet dort im Posteingang
// (Stamm-Postfach, `messages`-Endpunkt `website/contact`). Spam-Schutz: Honeypot, Rate-Limit je IP und insgesamt,
// Proof-of-Work + Zeitfalle (Lösung aus `ContactGuard.svelte`, geprüft im Backend), CSRF über `ORIGIN`.
// Rückfall bei Ausfall des Backends: Versand per SMTP an eine feste Adresse (#31), falls konfiguriert.
import { fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { BackendError, submitContact } from '$lib/server/backend';
import { isTrapped } from '$lib/server/bot-trap';
import { createRateLimiter } from '$lib/server/cache';
import {
	buildContactMessage,
	parseContactForm,
	parsePow,
	type ContactInput
} from '$lib/server/contact';
import { sendMail, type SmtpConfig } from '$lib/server/smtp';
import type { Actions } from './$types';

/** je Besucher-IP höchstens 5 Nachrichten in 10 Minuten */
const perIp = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 });
/** insgesamt höchstens 30 Nachrichten je Stunde (Schutz des Postfachs) */
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

/** Rückfall per SMTP; `false`, wenn nicht konfiguriert oder fehlgeschlagen */
async function sendBySmtp(value: ContactInput): Promise<boolean> {
	const config = smtpConfig();
	if (!config) return false;
	try {
		await sendMail(
			config.smtp,
			{ from: config.from, to: [config.to] },
			buildContactMessage(value, { from: config.from, to: config.to })
		);
		return true;
	} catch (e) {
		// ohne personenbezogene Daten protokollieren
		console.error('Kontaktformular: SMTP-Versand fehlgeschlagen –', (e as Error).message);
		return false;
	}
}

const UNAVAILABLE =
	'Die Nachricht konnte gerade nicht versendet werden. Bitte versuche es später noch einmal ' +
	'oder schreib uns direkt an stafues@edelweisspiraten-bremen.de.';
const POW_MISSING =
	'Der Spam-Schutz ist noch nicht fertig (dafür braucht es JavaScript). Bitte warte einen Moment und sende erneut ' +
	'– oder schreib uns direkt an stafues@edelweisspiraten-bremen.de.';

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
		// Bot-Falle (`lib/server/bot-trap.ts`): wie beim Honeypot neutral „Erfolg“, nichts senden
		if (isTrapped(ip)) throw redirect(303, '/kontakt?success=1#kontakt');

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

		const pow = parsePow(form);
		if (!pow) return fail(400, { error: POW_MISSING, errors: {}, values: parsed.value });
		if (!total.hit('alle').allowed) {
			return fail(503, { error: UNAVAILABLE, errors: {}, values: parsed.value });
		}

		try {
			await submitContact({ ...parsed.value, pow });
		} catch (e) {
			const status = e instanceof BackendError ? e.status : 503;
			if (status === 422 || status === 400) {
				// Spam-Schutz nicht bestanden (zu schnell, abgelaufen, ungültig) oder Eingabe abgelehnt
				return fail(400, {
					error: (e as Error).message || UNAVAILABLE,
					errors: {},
					values: parsed.value
				});
			}
			// Backend weg/falsch eingerichtet → per SMTP, sonst Hinweis
			if (!(await sendBySmtp(parsed.value))) {
				return fail(503, { error: UNAVAILABLE, errors: {}, values: parsed.value });
			}
		}
		throw redirect(303, '/kontakt?success=1#kontakt');
	}
};
