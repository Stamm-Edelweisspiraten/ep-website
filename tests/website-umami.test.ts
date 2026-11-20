import { describe, expect, it, vi } from 'vitest';

vi.mock('$env/dynamic/private', () => ({ env: {} }));

const { isOwnEvent, parseUmamiConfig, MAX_EVENT_BYTES } = await import('../src/lib/server/umami');

const ID = '3f2b1c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';

describe('Umami-Konfiguration', () => {
	it('braucht gültige http(s)-Adresse und UUID, entfernt den Schrägstrich am Ende', () => {
		expect(parseUmamiConfig('https://statistik.example.de/', ID)).toEqual({
			url: 'https://statistik.example.de',
			websiteId: ID
		});
		expect(parseUmamiConfig('http://umami:3000', ID.toUpperCase())?.websiteId).toBe(ID);
	});

	it('ist aus bei fehlenden oder ungültigen Werten', () => {
		expect(parseUmamiConfig(undefined, ID)).toBeNull();
		expect(parseUmamiConfig('https://statistik.example.de', undefined)).toBeNull();
		expect(parseUmamiConfig('https://statistik.example.de', 'keine-uuid')).toBeNull();
		expect(parseUmamiConfig('javascript:alert(1)', ID)).toBeNull();
		expect(parseUmamiConfig('statistik.example.de', ID)).toBeNull();
	});
});

describe('Weiterleitung nur eigener Ereignisse', () => {
	const event = (website: string, type = 'event') => JSON.stringify({ type, payload: { website, url: '/' } });

	it('lässt Ereignisse der eigenen Website durch', () => {
		expect(isOwnEvent(event(ID), ID)).toBe(true);
		expect(isOwnEvent(event(ID.toUpperCase()), ID)).toBe(true);
	});

	it('weist fremde Websites, falsche Typen, kaputtes JSON und zu große Anfragen ab', () => {
		expect(isOwnEvent(event('00000000-0000-0000-0000-000000000000'), ID)).toBe(false);
		expect(isOwnEvent(event(ID, 'admin'), ID)).toBe(false);
		expect(isOwnEvent('{kaputt', ID)).toBe(false);
		expect(isOwnEvent('', ID)).toBe(false);
		expect(isOwnEvent(event(ID).padEnd(MAX_EVENT_BYTES + 1, ' '), ID)).toBe(false);
	});
});
