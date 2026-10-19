import { describe, expect, it } from 'vitest';
import {
	dateParts,
	formatDate,
	formatDateLong,
	formatDateShort,
	formatDateRange,
	formatMeeting,
	formatTime,
	parseDate,
	safeColor,
	todayIso,
	weekdayAdverb,
	weekdayName
} from './format';

describe('parseDate', () => {
	it('liest gültige Daten', () => {
		expect(parseDate('2026-12-24')?.getUTCDate()).toBe(24);
	});
	it('lehnt ungültige Daten ab', () => {
		expect(parseDate('2026-02-30')).toBeNull();
		expect(parseDate('24.12.2026')).toBeNull();
		expect(parseDate('')).toBeNull();
		expect(parseDate(null)).toBeNull();
	});
});

describe('formatDate', () => {
	it('formatiert deutsch', () => {
		expect(formatDate('2026-12-24')).toBe('24.12.2026');
		expect(formatDateLong('2026-12-24')).toBe('Donnerstag, 24. Dezember 2026');
		expect(formatDate('quatsch')).toBe('');
	});
	it('liefert Kachel-Teile', () => {
		expect(dateParts('2026-03-01')).toEqual({
			day: '1',
			month: 'März',
			weekday: 'So.',
			year: '2026'
		});
		expect(dateParts(null)).toBeNull();
	});
	it('formatiert Uhrzeiten', () => {
		expect(formatTime('16:30')).toBe('16:30 Uhr');
		expect(formatTime('25:00')).toBe('');
		expect(formatTime(null)).toBe('');
	});
});

describe('formatDateRange', () => {
	it('ganztägig, ein Tag', () => {
		expect(formatDateRange({ startsOn: '2026-12-24' })).toBe('24.12.2026');
		expect(formatDateRange({ startsOn: '2026-12-24', endsOn: '2026-12-24' })).toBe('24.12.2026');
	});
	it('ein Tag mit Uhrzeiten', () => {
		expect(formatDateRange({ startsOn: '2026-12-24', startsTime: '16:30' })).toBe(
			'24.12.2026, 16:30 Uhr'
		);
		expect(
			formatDateRange({
				startsOn: '2026-12-24',
				startsTime: '16:30',
				endsOn: '2026-12-24',
				endsTime: '18:00'
			})
		).toBe('24.12.2026, 16:30–18:00 Uhr');
		expect(
			formatDateRange({ startsOn: '2026-12-24', startsTime: '16:30', endsTime: '18:00' })
		).toBe('24.12.2026, 16:30–18:00 Uhr');
	});
	it('mehrtägig', () => {
		expect(formatDateRange({ startsOn: '2026-12-24', endsOn: '2026-12-26' })).toBe(
			'24.12.–26.12.2026'
		);
		expect(formatDateRange({ startsOn: '2026-12-30', endsOn: '2027-01-02' })).toBe(
			'30.12.2026–02.01.2027'
		);
		expect(
			formatDateRange({
				startsOn: '2026-12-24',
				startsTime: '16:30',
				endsOn: '2026-12-26',
				endsTime: '12:00'
			})
		).toBe('24.12.2026, 16:30 Uhr – 26.12.2026, 12:00 Uhr');
	});
	it('ungültiger Start → leer', () => {
		expect(formatDateRange({ startsOn: 'x' })).toBe('');
	});
});

describe('Wochentage', () => {
	it('1–7', () => {
		expect(weekdayName(1)).toBe('Montag');
		expect(weekdayName(7)).toBe('Sonntag');
		expect(weekdayAdverb(1)).toBe('montags');
		expect(weekdayAdverb(5)).toBe('freitags');
	});
	it('Grenzen', () => {
		expect(weekdayName(0)).toBe('');
		expect(weekdayName(8)).toBe('');
		expect(weekdayName(1.5)).toBe('');
		expect(weekdayName(null)).toBe('');
		expect(weekdayAdverb(undefined)).toBe('');
	});
	it('Gruppenstunde', () => {
		expect(formatMeeting(5, '16:30')).toBe('Freitags 16:30 Uhr');
		expect(formatMeeting(1, null)).toBe('Montags');
		expect(formatMeeting(null, '16:30')).toBe('16:30 Uhr');
		expect(formatMeeting(null, null)).toBe('');
	});
	it('mit Ende der Gruppenstunde', () => {
		expect(formatMeeting(5, '16:30', '18:00')).toBe('Freitags 16:30 – 18:00 Uhr');
		expect(formatMeeting(null, '18:00', '19:30')).toBe('18:00 – 19:30 Uhr');
		expect(formatMeeting(5, '16:30', null)).toBe('Freitags 16:30 Uhr');
	});
	it('ignoriert Ende ohne Beginn, Ende ≤ Beginn und ungültige Zeiten', () => {
		expect(formatMeeting(1, null, '18:00')).toBe('Montags');
		expect(formatMeeting(1, '18:00', '18:00')).toBe('Montags 18:00 Uhr');
		expect(formatMeeting(1, '18:00', '17:00')).toBe('Montags 18:00 Uhr');
		expect(formatMeeting(1, '18:00', '25:00')).toBe('Montags 18:00 Uhr');
		expect(formatMeeting(1, '8:00', '9:00')).toBe('Montags');
	});
});

describe('todayIso', () => {
	it('nutzt Berliner Zeit', () => {
		// 23:30 UTC am 31.12. ist in Berlin bereits der 1.1.
		expect(todayIso(new Date('2026-12-31T23:30:00Z'))).toBe('2027-01-01');
	});
});

describe('formatDateShort', () => {
	it('kompakt', () => {
		expect(formatDateShort('2026-12-24')).toBe('Do., 24.12.');
	});
});

describe('safeColor', () => {
	it('lässt nur #rrggbb durch', () => {
		expect(safeColor('#24593C')).toBe('#24593C');
		expect(safeColor('red; background:url(x)')).toBeUndefined();
		expect(safeColor(null)).toBeUndefined();
	});
});
