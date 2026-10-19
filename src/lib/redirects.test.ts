import { describe, expect, it } from 'vitest';
import {
	GROUPS_FALLBACK,
	LEGACY_GROUP_SLUGS,
	legacyRedirectTarget,
	needsGroupLookup,
	normalizeLegacyPath
} from './redirects';

const ALL = ['sportliche-panther', 'funkelfuechse', 'die-goldenen-loewenzaehne'];

describe('normalizeLegacyPath', () => {
	it('entfernt Schrägstriche am Ende und vereinheitlicht die Schreibweise', () => {
		expect(normalizeLegacyPath('/meute/')).toBe('/meute');
		expect(normalizeLegacyPath('/Sippe/Funkelfuechse')).toBe('/sippe/funkelfuechse');
		expect(normalizeLegacyPath('/')).toBe('/');
	});
	it('fasst Unterpfade von /download zusammen', () => {
		expect(normalizeLegacyPath('/download/datei.pdf')).toBe('/download');
	});
});

describe('legacyRedirectTarget', () => {
	it('leitet alte Gruppenseiten auf /gruppen/<slug>', () => {
		expect(legacyRedirectTarget('/meute', ALL)).toBe('/gruppen/sportliche-panther');
		expect(legacyRedirectTarget('/sippe/funkelfuechse', ALL)).toBe('/gruppen/funkelfuechse');
		expect(legacyRedirectTarget('/sippe/die-goldenen-loewenzaehne/', ALL)).toBe(
			'/gruppen/die-goldenen-loewenzaehne'
		);
	});
	it('leitet auf /gruppen, wenn die Gruppe nicht auf der Website steht', () => {
		expect(legacyRedirectTarget('/meute', ['funkelfuechse'])).toBe(GROUPS_FALLBACK);
		expect(legacyRedirectTarget('/sippe/funkelfuechse', [])).toBe(GROUPS_FALLBACK);
	});
	it('leitet bei unbekannter Gruppenliste (API-Fehler) trotzdem aufs Ziel', () => {
		expect(legacyRedirectTarget('/meute', null)).toBe('/gruppen/sportliche-panther');
	});
	it('kennt die Seiten ohne Gruppenbezug', () => {
		expect(legacyRedirectTarget('/sippe', null)).toBe('/gruppen');
		expect(legacyRedirectTarget('/download', null)).toBe('/');
		expect(legacyRedirectTarget('/download/flyer.pdf', [])).toBe('/');
	});
	it('liefert null für unbekannte Adressen', () => {
		expect(legacyRedirectTarget('/sippe/unbekannt', ALL)).toBeNull();
		expect(legacyRedirectTarget('/kontakt', ALL)).toBeNull();
	});
	it('nutzt nur gültige Slugs', () => {
		for (const slug of Object.values(LEGACY_GROUP_SLUGS)) {
			expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
		}
	});
});

describe('needsGroupLookup', () => {
	it('nur für Gruppenseiten', () => {
		expect(needsGroupLookup('/meute/')).toBe(true);
		expect(needsGroupLookup('/sippe')).toBe(false);
		expect(needsGroupLookup('/download')).toBe(false);
	});
});
