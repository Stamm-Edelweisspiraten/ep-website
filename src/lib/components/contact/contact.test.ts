import { describe, expect, it } from 'vitest';
import type { WebsiteOffice, WebsiteOfficeHolder } from '$lib/server/types';
import {
	firstName,
	initials,
	isLongText,
	LONG_TEXT_CHARS,
	sinceYear,
	sortOffices,
	teamMembers,
	vacantOffices,
	withFirstNames
} from './contact';

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

describe('firstName', () => {
	it('nimmt den ersten Namensteil, Bindestrich-Namen bleiben ganz', () => {
		expect(firstName('Anna Beispiel')).toBe('Anna');
		expect(firstName('  Anna Maria  von Beispiel ')).toBe('Anna');
		expect(firstName('Jan-Ole Muster')).toBe('Jan-Ole');
		expect(firstName('Fipsi')).toBe('Fipsi');
		expect(firstName('   ')).toBe('');
	});
});

describe('withFirstNames', () => {
	it('kürzt nur die Namen der Inhaber*innen und lässt alles andere unverändert', () => {
		const office = {
			id: 'o1',
			name: 'Kasse',
			description: null,
			position: 1,
			emails: [],
			holders: [
				{ id: 'u1', name: 'Bernd Prüfer', bio: 'Text', since: '2022-01-01', avatarPath: null },
				{ id: 'u2', name: '  ', bio: null, since: null, avatarPath: null }
			]
		} as WebsiteOffice;
		const [result] = withFirstNames([office]);
		expect(result!.name).toBe('Kasse');
		expect(result!.holders.map((h) => h.name)).toEqual(['Bernd', '  ']);
		expect(result!.holders[0]!.bio).toBe('Text');
		expect(office.holders[0]!.name).toBe('Bernd Prüfer');
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

function holder(id: string, over: Partial<WebsiteOfficeHolder> = {}): WebsiteOfficeHolder {
	return { id, name: `Person ${id}`, bio: null, since: null, avatarPath: null, ...over };
}

function office(id: string, position: number, holders: WebsiteOfficeHolder[]): WebsiteOffice {
	return { id, name: `Amt ${id}`, description: null, position, emails: [], holders };
}

describe('sortOffices', () => {
	it('sortiert nach position, ohne die Eingabe zu ändern', () => {
		const input = [office('b', 2, []), office('a', 1, [])];
		expect(sortOffices(input).map((o) => o.id)).toEqual(['a', 'b']);
		expect(input.map((o) => o.id)).toEqual(['b', 'a']);
	});
});

describe('teamMembers', () => {
	it('fasst Personen mit mehreren Ämtern zusammen (Amts-Reihenfolge)', () => {
		const team = teamMembers([
			office('kasse', 2, [holder('u1', { since: '2022-01-01' }), holder('u3')]),
			office('stafue', 1, [holder('u2'), holder('u1', { since: '2020-05-01', bio: 'Hallo' })])
		]);
		expect(team.map((m) => m.id)).toEqual(['u2', 'u1', 'u3']);
		const u1 = team.find((m) => m.id === 'u1')!;
		expect(u1.offices).toEqual([
			{ id: 'stafue', name: 'Amt stafue', since: '2020-05-01' },
			{ id: 'kasse', name: 'Amt kasse', since: '2022-01-01' }
		]);
		expect(u1.bio).toBe('Hallo');
	});
	it('übernimmt Bild und Beschreibung aus einem späteren Amt, falls vorher leer', () => {
		const team = teamMembers([
			office('a', 1, [holder('u1')]),
			office('b', 2, [holder('u1', { bio: 'Text', avatarPath: '/api/x?v=1' })])
		]);
		expect(team[0]).toMatchObject({ bio: 'Text', avatarPath: '/api/x?v=1' });
	});
	it('leer ohne Ämter oder Inhaber*innen', () => {
		expect(teamMembers([])).toEqual([]);
		expect(teamMembers([office('a', 1, [])])).toEqual([]);
	});
});

describe('vacantOffices', () => {
	it('liefert unbesetzte Ämter in Reihenfolge', () => {
		const list = [office('c', 3, []), office('a', 1, [holder('u1')]), office('b', 2, [])];
		expect(vacantOffices(list).map((o) => o.id)).toEqual(['b', 'c']);
	});
});
