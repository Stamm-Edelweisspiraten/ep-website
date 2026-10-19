import { describe, expect, it } from 'vitest';
import { initials, isLongText, LONG_TEXT_CHARS, sinceYear } from './contact';

describe('initials', () => {
	it('nimmt den ersten und letzten Namensteil', () => {
		expect(initials('Larissa Muster')).toBe('LM');
		expect(initials('Anna Maria von Beispiel')).toBe('AB');
		expect(initials('Fipsi')).toBe('F');
		expect(initials('  émile  ')).toBe('É');
		expect(initials('Jan-Ole')).toBe('JO');
	});
	it('liefert ? ohne Namen', () => {
		expect(initials('')).toBe('?');
		expect(initials('   ')).toBe('?');
	});
});

describe('sinceYear', () => {
	it('liest das Jahr', () => {
		expect(sinceYear('2021-09-01')).toBe('2021');
	});
	it('ignoriert ungültige Werte', () => {
		expect(sinceYear(null)).toBeNull();
		expect(sinceYear('')).toBeNull();
		expect(sinceYear('09/2021')).toBeNull();
	});
});

describe('isLongText', () => {
	it('erkennt lange Texte an Länge und Zeilen', () => {
		expect(isLongText(null)).toBe(false);
		expect(isLongText('kurz')).toBe(false);
		expect(isLongText('a'.repeat(LONG_TEXT_CHARS))).toBe(false);
		expect(isLongText('a'.repeat(LONG_TEXT_CHARS + 1))).toBe(true);
		expect(isLongText('1\n2\n3\n4\n5\n6')).toBe(true);
	});
});
