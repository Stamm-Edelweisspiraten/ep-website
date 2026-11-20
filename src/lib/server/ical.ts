/**
 * Termine als iCalendar-Abo (RFC 5545) für `/termine.ics` – rein, getestet in `tests/website-ical.test.ts`.
 *
 * Zeiten stehen als Ortszeit mit `TZID=Europe/Berlin` (inkl. VTIMEZONE), Termine ohne Uhrzeit als ganztägig
 * (`VALUE=DATE`, Ende exklusiv). Zeilen werden nach 75 Bytes (UTF-8) gefaltet.
 */
import type { SiteEvent } from '$lib/site-types';

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^(\d{2}):(\d{2})/;

/** Text-Werte escapen (Backslash, Semikolon, Komma, Zeilenumbruch) */
export function escapeText(value: string): string {
	return value
		.replace(/\\/g, '\\\\')
		.replace(/;/g, '\\;')
		.replace(/,/g, '\\,')
		.replace(/\r?\n/g, '\\n');
}

/** Eine Inhaltszeile nach höchstens 75 Bytes falten (Fortsetzung mit führendem Leerzeichen) */
export function foldLine(line: string): string {
	const enc = new TextEncoder();
	if (enc.encode(line).length <= 75) return line;
	const parts: string[] = [];
	let current = '';
	let bytes = 0;
	for (const ch of line) {
		const size = enc.encode(ch).length;
		const limit = parts.length === 0 ? 75 : 74; // Folgezeilen beginnen mit einem Leerzeichen
		if (bytes + size > limit) {
			parts.push(current);
			current = '';
			bytes = 0;
		}
		current += ch;
		bytes += size;
	}
	parts.push(current);
	return parts.join('\r\n ');
}

const compactDate = (date: string) => date.replace(/-/g, '');

function addDays(date: string, days: number): string {
	const m = DATE_RE.exec(date);
	if (!m) return date;
	const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + days));
	return d.toISOString().slice(0, 10);
}

function localDateTime(date: string, time: string): string {
	const t = TIME_RE.exec(time);
	return `${compactDate(date)}T${t ? `${t[1]}${t[2]}` : '0000'}00`;
}

/** Ende eines Termins mit Uhrzeit, wenn keine Endzeit da ist: +1 h, höchstens 23:59 */
function plusOneHour(time: string): string {
	const t = TIME_RE.exec(time);
	if (!t) return '23:59';
	const h = Number(t[1]) + 1;
	return h >= 24 ? '23:59' : `${String(h).padStart(2, '0')}:${t[2]}`;
}

function utcStamp(now: Date): string {
	return now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function plain(text: string, max = 1000): string {
	const t = text
		.replace(/<[^>]*>/g, ' ')
		.replace(/[ \t]+/g, ' ')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
	return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

const VTIMEZONE = [
	'BEGIN:VTIMEZONE',
	'TZID:Europe/Berlin',
	'BEGIN:DAYLIGHT',
	'TZOFFSETFROM:+0100',
	'TZOFFSETTO:+0200',
	'TZNAME:CEST',
	'DTSTART:19700329T020000',
	'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
	'END:DAYLIGHT',
	'BEGIN:STANDARD',
	'TZOFFSETFROM:+0200',
	'TZOFFSETTO:+0100',
	'TZNAME:CET',
	'DTSTART:19701025T030000',
	'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
	'END:STANDARD',
	'END:VTIMEZONE'
];

export interface CalendarInput {
	events: SiteEvent[];
	/** öffentliche Basis-URL ohne `/` am Ende */
	base: string;
	/** Name des Kalenders in der Kalender-App */
	name: string;
	description?: string;
	now?: Date;
}

function eventLines(e: SiteEvent, base: string, host: string, stamp: string): string[] {
	const lines = ['BEGIN:VEVENT', `UID:${e.key.replace(/[^A-Za-z0-9~._-]/g, '')}@${host}`, `DTSTAMP:${stamp}`];
	const end = e.endsOn && e.endsOn >= e.startsOn ? e.endsOn : e.startsOn;
	if (e.startsTime) {
		lines.push(`DTSTART;TZID=Europe/Berlin:${localDateTime(e.startsOn, e.startsTime)}`);
		const endTime = e.endsTime ?? (end === e.startsOn ? plusOneHour(e.startsTime) : '23:59');
		lines.push(`DTEND;TZID=Europe/Berlin:${localDateTime(end, endTime)}`);
	} else {
		lines.push(`DTSTART;VALUE=DATE:${compactDate(e.startsOn)}`);
		lines.push(`DTEND;VALUE=DATE:${compactDate(addDays(end, 1))}`);
	}
	lines.push(`SUMMARY:${escapeText(e.title)}`);
	const url = `${base}/termine/${encodeURIComponent(e.key)}`;
	const desc = plain(e.description);
	lines.push(`DESCRIPTION:${escapeText(desc ? `${desc}\n\n${url}` : url)}`);
	if (e.location) lines.push(`LOCATION:${escapeText(e.location)}`);
	lines.push(`URL:${url}`);
	const categories = [...e.groups.map((g) => g.name), ...e.tags].filter(Boolean);
	if (categories.length) lines.push(`CATEGORIES:${categories.map(escapeText).join(',')}`);
	lines.push('END:VEVENT');
	return lines;
}

/** Fertige `.ics`-Datei (CRLF-Zeilenenden) */
export function buildCalendar(input: CalendarInput): string {
	const base = input.base.replace(/\/+$/, '');
	let host = 'edelweisspiraten-bremen.de';
	try {
		host = new URL(base).host || host;
	} catch {
		// Standard behalten
	}
	const stamp = utcStamp(input.now ?? new Date());
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Stamm Edelweißpiraten//Website//DE',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		`X-WR-CALNAME:${escapeText(input.name)}`,
		'X-WR-TIMEZONE:Europe/Berlin',
		...(input.description ? [`X-WR-CALDESC:${escapeText(input.description)}`] : []),
		'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
		'X-PUBLISHED-TTL:PT6H',
		...VTIMEZONE,
		...input.events.flatMap((e) => eventLines(e, base, host, stamp)),
		'END:VCALENDAR'
	];
	return lines.map(foldLine).join('\r\n') + '\r\n';
}
