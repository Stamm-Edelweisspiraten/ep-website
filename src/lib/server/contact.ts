/**
 * Kontaktformular (#31): Prüfung der Eingaben und Aufbau der Mail (rein, ohne SvelteKit-Importe –
 * getestet in `tests/unit/website-contact.test.ts`).
 *
 * Schutz gegen Missbrauch als Mail-Relay:
 * - Empfänger und Absender kommen **nur** aus der Server-Konfiguration (`CONTACT_TO`, `SMTP_FROM`), nie aus dem Formular.
 * - Betreff fest, keine Eingabe in Kopfzeilen außer `Reply-To` (streng geprüfte Adresse ohne Anzeigename).
 * - Text als Base64 (UTF-8), daher keine Kopfzeilen-/SMTP-Injection über den Nachrichtentext.
 * - Keine automatische Antwort an die eingegebene Adresse (sonst Versand an beliebige Dritte).
 * - Honeypot-Feld und Rate-Limit je IP (in `routes/kontakt/+page.server.ts`).
 */
import { randomUUID } from 'node:crypto';

export const CONTACT_LIMITS = { name: 100, email: 254, phone: 40, message: 5000 } as const;
/** Name des versteckten Honeypot-Felds (Menschen sehen es nicht, Bots füllen es aus) */
export const HONEYPOT_FIELD = 'website';
export const CONTACT_SUBJECT = 'Kontaktanfrage über die Website';

export interface ContactInput {
	name: string;
	email: string;
	phone: string;
	message: string;
}

export type ContactField = keyof ContactInput | 'consent';

export type ParsedContact =
	| { ok: true; spam: boolean; value: ContactInput }
	| { ok: false; errors: Partial<Record<ContactField, string>>; values: ContactInput };

const EMAIL_RE = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
const PHONE_RE = /^[0-9+()/ .-]*$/;
// eslint-disable-next-line no-control-regex
const CONTROL_RE = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

function field(form: FormData, name: string) {
	const v = form.get(name);
	return typeof v === 'string' ? v : '';
}

/** Einzeiliger Text: Steuerzeichen und Zeilenumbrüche raus, Leerraum zusammenfassen */
function oneLine(v: string) {
	return v.replace(CONTROL_RE, '').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function parseContactForm(form: FormData): ParsedContact {
	const values: ContactInput = {
		name: oneLine(field(form, 'name')),
		email: oneLine(field(form, 'email')),
		phone: oneLine(field(form, 'phone')),
		message: field(form, 'message').replace(CONTROL_RE, '').replace(/\r\n?/g, '\n').trim()
	};
	const errors: Partial<Record<ContactField, string>> = {};
	if (!values.name) errors.name = 'Bitte gib deinen Namen an.';
	else if (values.name.length > CONTACT_LIMITS.name) errors.name = 'Der Name ist zu lang.';
	if (!values.email) errors.email = 'Bitte gib deine E-Mail-Adresse an.';
	else if (values.email.length > CONTACT_LIMITS.email || !EMAIL_RE.test(values.email)) {
		errors.email = 'Bitte gib eine gültige E-Mail-Adresse an.';
	}
	if (values.phone.length > CONTACT_LIMITS.phone || !PHONE_RE.test(values.phone)) {
		errors.phone = 'Bitte gib eine gültige Telefonnummer an.';
	}
	if (!values.message) errors.message = 'Bitte schreib uns eine Nachricht.';
	else if (values.message.length > CONTACT_LIMITS.message) {
		errors.message = `Die Nachricht darf höchstens ${CONTACT_LIMITS.message} Zeichen lang sein.`;
	}
	if (field(form, 'consent') !== 'on' && field(form, 'consent') !== '1') {
		errors.consent = 'Bitte bestätige die Hinweise zum Datenschutz.';
	}
	const spam = field(form, HONEYPOT_FIELD).trim() !== '';
	if (Object.keys(errors).length > 0 && !spam) return { ok: false, errors, values };
	return { ok: true, spam, value: values };
}

/** RFC 2047 (B-Kodierung) für Kopfzeilen mit Umlauten */
function encodeWord(text: string) {
	return /^[\x20-\x7e]*$/.test(text)
		? text
		: `=?UTF-8?B?${Buffer.from(text, 'utf8').toString('base64')}?=`;
}

function base64Lines(text: string) {
	return (
		Buffer.from(text, 'utf8')
			.toString('base64')
			.match(/.{1,76}/g)
			?.join('\r\n') ?? ''
	);
}

/** Fertige Mail (Kopfzeilen + Base64-Text) an die feste Kontaktadresse. */
export function buildContactMessage(
	input: ContactInput,
	options: { from: string; fromName?: string; to: string; date?: Date }
): string {
	if (!EMAIL_RE.test(input.email)) throw new Error('Ungültige Antwortadresse');
	const domain = options.from.split('@')[1] ?? 'localhost';
	const text = [
		'Neue Nachricht über das Kontaktformular der Website',
		'',
		`Name: ${input.name}`,
		`E-Mail: ${input.email}`,
		`Telefon: ${input.phone || '–'}`,
		'',
		'Nachricht:',
		input.message,
		'',
		'--',
		'„Antworten“ geht direkt an die absendende Person. Die Angaben wurden über das Formular auf',
		'der Website eingegeben und nicht geprüft.'
	].join('\n');
	const fromName = oneLine(options.fromName ?? 'Website Stamm Edelweißpiraten').replace(/["\\]/g, '');
	const headers = [
		`From: "${encodeWord(fromName)}" <${options.from}>`,
		`To: <${options.to}>`,
		`Reply-To: <${input.email}>`,
		`Subject: ${encodeWord(CONTACT_SUBJECT)}`,
		`Date: ${(options.date ?? new Date()).toUTCString().replace('GMT', '+0000')}`,
		`Message-ID: <${randomUUID()}@${domain}>`,
		'MIME-Version: 1.0',
		'Content-Type: text/plain; charset=utf-8',
		'Content-Transfer-Encoding: base64',
		'X-Auto-Response-Suppress: All'
	];
	return `${headers.join('\r\n')}\r\n\r\n${base64Lines(text.replace(/\n/g, '\r\n'))}\r\n`;
}
