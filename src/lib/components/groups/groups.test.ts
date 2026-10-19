import { describe, expect, it } from 'vitest';
import type { WebsiteGroup } from '$lib/server/types';
import {
	GROUP_FALLBACK_COLOR,
	groupColor,
	groupImage,
	groupSections,
	groupTitle,
	joinNames,
	leaderText
} from './groups';

function group(partial: Partial<WebsiteGroup>): WebsiteGroup {
	return {
		id: 'g1',
		slug: 'gruppe',
		name: 'Gruppe',
		type: 'sippe',
		description: null,
		ageRange: null,
		meetingPlace: null,
		meetingWeekday: null,
		meetingTime: null,
		meetingEndTime: null,
		color: null,
		contactEmail: null,
		leaders: [],
		imagePath: null,
		...partial
	};
}

describe('joinNames', () => {
	it('verbindet deutsch', () => {
		expect(joinNames([])).toBe('');
		expect(joinNames(['Larissa'])).toBe('Larissa');
		expect(joinNames(['Larissa', 'Fipsi'])).toBe('Larissa und Fipsi');
		expect(joinNames(['Larissa', 'Elisabeth', 'Fipsi'])).toBe('Larissa, Elisabeth und Fipsi');
	});
	it('ignoriert leere Namen', () => {
		expect(joinNames([' ', 'Melina', '', 'Sebastian '])).toBe('Melina und Sebastian');
	});
});

describe('leaderText', () => {
	it('nimmt die Vornamen der Leitung', () => {
		expect(leaderText({ leaders: [{ firstName: 'Melina' }, { firstName: 'Sebastian' }] })).toBe(
			'Melina und Sebastian'
		);
	});
});

describe('groupImage', () => {
	it('bevorzugt das Bild aus dem Intern-Bereich', () => {
		expect(groupImage({ slug: 'funkelfuechse', imagePath: '/api/x/image?v=3' })).toBe(
			'/bilder/gruppe/funkelfuechse?v=3'
		);
	});
	it('nutzt sonst das statische Ersatzbild', () => {
		expect(groupImage({ slug: 'sportliche-panther', imagePath: null })).toBe('/meute_panther.avif');
	});
	it('liefert null ohne Bild', () => {
		expect(groupImage({ slug: 'neue-gruppe', imagePath: null })).toBeNull();
	});
});

describe('groupSections', () => {
	it('gruppiert Meute vor Sippe und lässt leere Abschnitte weg', () => {
		const sections = groupSections([
			group({ id: 'a', type: 'sippe' }),
			group({ id: 'b', type: 'meute' }),
			group({ id: 'c', type: 'sippe' })
		]);
		expect(sections.map((s) => s.label)).toEqual(['Meute', 'Sippe']);
		expect(sections[1]!.groups.map((g) => g.id)).toEqual(['a', 'c']);
		expect(groupSections([group({ type: 'sippe' })]).map((s) => s.type)).toEqual(['sippe']);
	});
});

describe('groupColor', () => {
	it('nimmt nur gültige Hex-Farben, sonst Indigo', () => {
		expect(groupColor({ color: '#c05621' })).toBe('#c05621');
		expect(groupColor({ color: null })).toBe(GROUP_FALLBACK_COLOR);
		expect(groupColor({ color: 'red;background:url(x)' })).toBe(GROUP_FALLBACK_COLOR);
	});
});

describe('groupTitle', () => {
	it('Typ mit Alter in Klammern', () => {
		expect(groupTitle({ type: 'meute', ageRange: '6 bis 10 Jahre' })).toBe(
			'Meute (6 bis 10 Jahre)'
		);
		expect(groupTitle({ type: 'sippe', ageRange: null })).toBe('Sippe');
		expect(groupTitle({ type: 'sippe', ageRange: '  ' })).toBe('Sippe');
	});
});
