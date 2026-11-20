import { describe, expect, it } from 'vitest';
import { buildCalendar, escapeText, foldLine } from '../src/lib/server/ical';
import type { SiteEvent } from '../src/lib/site-types';

const base: SiteEvent = {
	key: 'abc',
	id: 'abc',
	title: 'Pfingstlager',
	description: '',
	location: null,
	color: null,
	startsOn: '2027-05-14',
	startsTime: null,
	endsOn: '2027-05-17',
	endsTime: null,
	recurring: false,
	occurrenceDate: null,
	groups: [],
	tags: [],
	galleries: []
};

const NOW = new Date('2026-11-20T10:00:00Z');
const cal = (events: SiteEvent[]) =>
	buildCalendar({ events, base: 'https://example.de/', name: 'Termine', now: NOW });

describe('iCalendar', () => {
	it('baut einen gültigen Rahmen mit CRLF, Zeitzone und Aktualisierungsintervall', () => {
		const ics = cal([]);
		expect(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n')).toBe(true);
		expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
		expect(ics).toContain('TZID:Europe/Berlin');
		expect(ics).toContain('REFRESH-INTERVAL;VALUE=DURATION:PT6H');
		expect(ics.replace(/\r\n/g, '')).not.toMatch(/\n/);
	});

	it('ganztägige Termine: VALUE=DATE, Ende exklusiv (Folgetag)', () => {
		const ics = cal([base]);
		expect(ics).toContain('DTSTART;VALUE=DATE:20270514');
		expect(ics).toContain('DTEND;VALUE=DATE:20270518');
		expect(ics).toContain('UID:abc@example.de');
		expect(ics).toContain('DTSTAMP:20261120T100000Z');
		expect(ics).toContain('URL:https://example.de/termine/abc');
	});

	it('Termine mit Uhrzeit in Europe/Berlin; ohne Endzeit +1 h', () => {
		const ics = cal([
			{ ...base, key: 'x~2027-01-12', startsOn: '2027-01-12', endsOn: null, startsTime: '16:30', endsTime: '18:00' },
			{ ...base, key: 'y', startsOn: '2027-01-13', endsOn: null, startsTime: '23:30', endsTime: null }
		]);
		expect(ics).toContain('DTSTART;TZID=Europe/Berlin:20270112T163000');
		expect(ics).toContain('DTEND;TZID=Europe/Berlin:20270112T180000');
		expect(ics).toContain('UID:x~2027-01-12@example.de');
		expect(ics).toContain('DTEND;TZID=Europe/Berlin:20270113T235900');
	});

	it('escaped Sonderzeichen, nimmt Ort, Gruppen und Themen mit', () => {
		const ics = cal([
			{
				...base,
				title: 'Lager; Teil 1, mit Eltern',
				location: 'Zeltplatz, Bremen',
				description: 'Zeile 1\nZeile 2',
				groups: [{ id: 'g', name: 'Funkelfüchse', color: null, href: '/meute/funkelfuechse' }],
				tags: ['Lager']
			}
		]);
		expect(ics).toContain('SUMMARY:Lager\\; Teil 1\\, mit Eltern');
		expect(ics).toContain('LOCATION:Zeltplatz\\, Bremen');
		expect(ics).toContain('CATEGORIES:Funkelfüchse,Lager');
		expect(ics.replace(/\r\n /g, '')).toContain('DESCRIPTION:Zeile 1\\nZeile 2\\n\\nhttps://example.de/termine/abc');
	});

	it('faltet lange Zeilen nach 75 Bytes, auch bei Umlauten', () => {
		const line = 'DESCRIPTION:' + 'ä'.repeat(100);
		const folded = foldLine(line);
		for (const part of folded.split('\r\n')) expect(new TextEncoder().encode(part).length).toBeLessThanOrEqual(75);
		expect(folded.replace(/\r\n /g, '')).toBe(line);
		expect(escapeText('a\\b')).toBe('a\\\\b');
	});
});
