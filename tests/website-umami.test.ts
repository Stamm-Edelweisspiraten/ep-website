import { describe, expect, it, vi } from 'vitest';

vi.mock('$env/dynamic/private', () => ({ env: {} }));

const { isOwnEvent, isOwnRecording, parseUmamiConfig, MAX_EVENT_BYTES, MAX_RECORD_BYTES } = await import('../src/lib/server/umami');

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

describe('Weiterleitung der Sitzungsaufzeichnung', () => {
	const pkg = (website: string, type = 'record') => JSON.stringify({ type, payload: { website, events: [] } });

	it('lässt Aufzeichnung und Heatmap der eigenen Website durch, auch größere Pakete', () => {
		expect(isOwnRecording(pkg(ID), ID)).toBe(true);
		expect(isOwnRecording(pkg(ID, 'heatmap'), ID)).toBe(true);
		expect(isOwnRecording(pkg(ID).padEnd(100_000, ' '), ID)).toBe(true);
	});

	it('weist fremde Websites, normale Ereignisse und Übergrößen ab', () => {
		expect(isOwnRecording(pkg('00000000-0000-0000-0000-000000000000'), ID)).toBe(false);
		expect(isOwnRecording(pkg(ID, 'event'), ID)).toBe(false);
		expect(isOwnEvent(pkg(ID), ID)).toBe(false);
		expect(isOwnRecording(pkg(ID).padEnd(MAX_RECORD_BYTES + 1, ' '), ID)).toBe(false);
	});
});

describe('Ereignisse ohne Eingaben (lib/track.ts)', async () => {
	const { fieldNames, track } = await import('../src/lib/track');

	it('Formularfehler: nur Feldnamen, sortiert, keine Inhalte', () => {
		expect(fieldNames({ email: 'ungültig: max@example.de', name: 'Pflicht' })).toBe('email,name');
		expect(fieldNames({ 'max@example.de': 'x' })).toBe('');
		expect(fieldNames(null)).toBe('');
	});

	it('ohne Umami passiert nichts (kein Fehler)', () => {
		expect(() => track('Test', { a: 1 })).not.toThrow();
	});
});
