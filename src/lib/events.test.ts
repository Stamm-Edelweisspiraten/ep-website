import { describe, expect, it } from 'vitest';
import type { WebsiteEvent } from './server/types';
import {
	addDays,
	collapseSeries,
	daysBetween,
	seriesRhythm,
	splitRange,
	buildSearch,
	collectGroups,
	collectTags,
	eventGroupLinks,
	eventHref,
	eventKey,
	eventWhen,
	filterEvents,
	galleryDate,
	galleryYear,
	groupByMonth,
	groupParamValue,
	imageCountLabel,
	isIsoDate,
	isPastEvent,
	monthLabel,
	osmSearchUrl,
	parsePage,
	parseReviewYear,
	resolveGroupParam,
	reviewRange,
	reviewYears,
	sortEvents
} from './events';

function ev(partial: Partial<WebsiteEvent> = {}): WebsiteEvent {
	return {
		id: 'e1',
		title: 'Gruppenstunde',
		description: null,
		location: null,
		color: null,
		startsOn: '2026-10-23',
		startsTime: null,
		endsOn: null,
		endsTime: null,
		tags: [],
		groups: [],
		groupIds: [],
		recurring: false,
		occurrenceDate: null,
		...partial
	};
}

describe('eventHref / eventKey', () => {
	it('verlinkt Serien-Vorkommen mit ?am=', () => {
		expect(eventHref(ev())).toBe('/termine/e1');
		expect(eventHref(ev({ recurring: true, occurrenceDate: '2026-10-30' }))).toBe(
			'/termine/e1?am=2026-10-30'
		);
		expect(eventKey(ev({ occurrenceDate: '2026-10-30' }))).toBe('e1:2026-10-30');
		expect(eventKey(ev())).toBe('e1');
	});
});

describe('isIsoDate / addDays', () => {
	it('prüft echte Daten', () => {
		expect(isIsoDate('2026-02-28')).toBe(true);
		expect(isIsoDate('2026-02-30')).toBe(false);
		expect(isIsoDate('2026-2-3')).toBe(false);
		expect(isIsoDate('heute')).toBe(false);
		expect(isIsoDate(null)).toBe(false);
	});
	it('rechnet über Monats- und Jahresgrenzen', () => {
		expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
		expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
	});
});

describe('eventWhen', () => {
	it('ein Tag', () => {
		expect(eventWhen(ev())).toBe('Ganztägig');
		expect(eventWhen(ev({ startsTime: '16:30' }))).toBe('16:30 Uhr');
		expect(eventWhen(ev({ startsTime: '16:30', endsTime: '18:00' }))).toBe('16:30–18:00 Uhr');
		expect(eventWhen(ev({ endsOn: '2026-10-23', startsTime: '10:00' }))).toBe('10:00 Uhr');
	});
	it('mehrtägig', () => {
		expect(eventWhen(ev({ endsOn: '2026-10-25' }))).toBe('bis So., 25.10.');
		expect(eventWhen(ev({ endsOn: '2026-10-25', startsTime: '16:30', endsTime: '12:00' }))).toBe(
			'16:30 Uhr bis So., 25.10., 12:00 Uhr'
		);
	});
});

describe('isPastEvent', () => {
	it('berücksichtigt das Ende', () => {
		expect(isPastEvent(ev({ startsOn: '2026-10-18' }), '2026-10-19')).toBe(true);
		expect(isPastEvent(ev({ startsOn: '2026-10-18', endsOn: '2026-10-19' }), '2026-10-19')).toBe(
			false
		);
	});
});

describe('groupByMonth / sortEvents', () => {
	it('gruppiert in Eingabereihenfolge', () => {
		const list = [
			ev({ id: 'a', startsOn: '2026-10-30' }),
			ev({ id: 'b', startsOn: '2026-11-02' }),
			ev({ id: 'c', startsOn: '2026-11-20' })
		];
		const months = groupByMonth(list);
		expect(months.map((m) => m.label)).toEqual(['Oktober 2026', 'November 2026']);
		expect(months[1]!.events.map((e) => e.id)).toEqual(['b', 'c']);
	});
	it('sortiert nach Datum, Uhrzeit, Titel', () => {
		const list = [
			ev({ id: 'c', startsOn: '2026-11-01' }),
			ev({ id: 'b', startsOn: '2026-10-01', startsTime: '18:00' }),
			ev({ id: 'a', startsOn: '2026-10-01', startsTime: '09:00' })
		];
		expect(sortEvents(list).map((e) => e.id)).toEqual(['a', 'b', 'c']);
		expect(sortEvents(list, 'desc').map((e) => e.id)).toEqual(['c', 'b', 'a']);
	});
	it('Monatsnamen mit Umlaut', () => {
		expect(monthLabel('2027-03')).toBe('März 2027');
		expect(monthLabel('kaputt')).toBe('kaputt');
	});
});

describe('Filter', () => {
	const list = [
		ev({ id: 'a', tags: ['Fahrt', 'Lager'], groups: ['Stamm'], groupIds: ['stamm'] }),
		ev({ id: 'b', tags: ['Fahrt'], groups: ['Panther', 'Stamm'], groupIds: ['g1', 'stamm'] }),
		ev({ id: 'c', tags: [], groups: ['Füchse'], groupIds: ['g2'] })
	];
	it('sammelt Tags und Gruppen mit Anzahl', () => {
		expect(collectTags(list)).toEqual([
			{ value: 'Fahrt', label: 'Fahrt', count: 2 },
			{ value: 'Lager', label: 'Lager', count: 1 }
		]);
		expect(collectGroups(list).map((g) => [g.value, g.label, g.count])).toEqual([
			['stamm', 'Stamm', 2],
			['g2', 'Füchse', 1],
			['g1', 'Panther', 1]
		]);
	});
	it('filtert nach Tag und Gruppe (UND)', () => {
		expect(filterEvents(list, { tag: 'Fahrt' }).map((e) => e.id)).toEqual(['a', 'b']);
		expect(filterEvents(list, { tag: 'Fahrt', group: 'g1' }).map((e) => e.id)).toEqual(['b']);
		expect(filterEvents(list, {}).length).toBe(3);
	});
	it('Gruppen-Parameter: Slug ↔ ID', () => {
		const groups = [{ id: 'g1', slug: 'sportliche-panther' }];
		expect(resolveGroupParam('sportliche-panther', groups)).toBe('g1');
		expect(resolveGroupParam('stamm', groups)).toBe('stamm');
		expect(resolveGroupParam(null, groups)).toBeNull();
		expect(groupParamValue('g1', groups)).toBe('sportliche-panther');
		expect(groupParamValue('g2', groups)).toBe('g2');
		expect(eventGroupLinks(list[1]!, groups)).toEqual([
			{ id: 'g1', name: 'Panther', href: '/gruppen/sportliche-panther' },
			{ id: 'stamm', name: 'Stamm', href: null }
		]);
	});
	it('baut Suchteile ohne leere Werte', () => {
		expect(buildSearch({ rueckblick: 2025, tag: 'Fahrt & Lager', gruppe: null })).toBe(
			'?rueckblick=2025&tag=Fahrt+%26+Lager'
		);
		expect(buildSearch({ tag: '' })).toBe('');
	});
});

describe('Rückblick', () => {
	it('Jahre bis 2023 rückwärts', () => {
		expect(reviewYears('2026-10-19')).toEqual([2026, 2025, 2024, 2023]);
		expect(reviewYears('2023-05-01')).toEqual([2023]);
	});
	it('prüft den Parameter', () => {
		expect(parseReviewYear('2024', '2026-10-19')).toBe(2024);
		expect(parseReviewYear('2022', '2026-10-19')).toBeNull();
		expect(parseReviewYear('2027', '2026-10-19')).toBeNull();
		expect(parseReviewYear('20x4', '2026-10-19')).toBeNull();
		expect(parseReviewYear(null)).toBeNull();
	});
	it('Zeitraum: ganzes Jahr bzw. bis gestern', () => {
		expect(reviewRange(2025, '2026-10-19')).toEqual({ from: '2025-01-01', to: '2025-12-31' });
		expect(reviewRange(2026, '2026-10-19')).toEqual({ from: '2026-01-01', to: '2026-10-18' });
		expect(reviewRange(2026, '2026-01-01')).toBeNull();
		expect(reviewRange(2026, '2026-01-02')).toEqual({ from: '2026-01-01', to: '2026-01-01' });
	});
});

describe('Sonstiges', () => {
	it('OpenStreetMap-Suche', () => {
		expect(osmSearchUrl(' Pfadfinderheim, Bremen ')).toBe(
			'https://www.openstreetmap.org/search?query=Pfadfinderheim%2C%20Bremen'
		);
	});
	it('Galerie-Datum aus Terminen, sonst updatedAt (Berlin)', () => {
		const events = [
			{ id: 'x', title: 'B', startsOn: '2025-08-02', endsOn: null },
			{ id: 'y', title: 'A', startsOn: '2025-07-01', endsOn: null }
		];
		expect(galleryDate({ events, updatedAt: '2026-01-01T00:00:00Z' })).toBe('2025-07-01');
		// 23:30 UTC am 31.12. ist in Berlin schon der 1.1.
		expect(galleryDate({ events: [], updatedAt: '2025-12-31T23:30:00Z' })).toBe('2026-01-01');
		expect(galleryYear({ events: [], updatedAt: 'kaputt' })).toBeNull();
	});
	it('Bildanzahl und Seiten', () => {
		expect(imageCountLabel(1)).toBe('1 Bild');
		expect(imageCountLabel(0)).toBe('0 Bilder');
		expect(parsePage('3')).toBe(3);
		expect(parsePage('0')).toBe(1);
		expect(parsePage('-2')).toBe(1);
		expect(parsePage(null)).toBe(1);
	});
});

describe('Serien', () => {
	const weekly = (dates: string[], extra: Partial<WebsiteEvent> = {}) =>
		dates.map((d) => ev({ id: 's1', recurring: true, occurrenceDate: d, startsOn: d, ...extra }));

	it('erkennt den Rhythmus', () => {
		// 23.10.2026 ist ein Freitag
		const fridays = ['2026-10-23', '2026-10-30', '2026-11-06'];
		expect(seriesRhythm(weekly(fridays, { startsTime: '16:30', endsTime: '18:00' }))).toBe(
			'freitags 16:30–18:00 Uhr'
		);
		// abgesagter Termin (Lücke) stört nicht
		expect(seriesRhythm(weekly(['2026-10-23', '2026-11-06', '2026-11-13']))).toBe('freitags');
		expect(seriesRhythm(weekly(['2026-10-24', '2026-11-07', '2026-12-05']))).toBe(
			'alle zwei Wochen samstags'
		);
		expect(seriesRhythm(weekly(['2026-10-19', '2026-10-21', '2026-10-26', '2026-10-28']))).toBe(
			'montags und mittwochs'
		);
		expect(
			seriesRhythm(
				weekly([
					'2026-10-19',
					'2026-10-20',
					'2026-10-21',
					'2026-10-22',
					'2026-10-23',
					'2026-10-24',
					'2026-10-25'
				])
			)
		).toBe('täglich');
		expect(seriesRhythm(weekly(['2026-10-03', '2026-11-03', '2026-12-03']))).toBe(
			'monatlich am 3.'
		);
	});

	it('unregelmäßig oder nur ein Vorkommen → „regelmäßig“', () => {
		expect(seriesRhythm(weekly(['2026-10-19', '2026-10-24', '2026-11-11']))).toBe('regelmäßig');
		expect(seriesRhythm(weekly(['2026-10-23'], { startsTime: '16:30' }))).toBe(
			'regelmäßig, 16:30 Uhr'
		);
		// abweichende Uhrzeiten → keine Zeitangabe
		expect(
			seriesRhythm([
				...weekly(['2026-10-23'], { startsTime: '16:30' }),
				...weekly(['2026-10-30'], { startsTime: '17:00' })
			])
		).toBe('freitags');
	});

	it('fasst Serien zusammen, Einzeltermine bleiben in Reihenfolge', () => {
		const list = [
			ev({ id: 'a', startsOn: '2026-10-20' }),
			...weekly(['2026-10-23']),
			ev({ id: 's2', recurring: true, occurrenceDate: '2026-10-24', startsOn: '2026-10-24' }),
			ev({ id: 'b', startsOn: '2026-10-25' }),
			...weekly(['2026-10-30', '2026-11-06'])
		];
		const { series, singles } = collapseSeries(list);
		expect(singles.map((e) => e.id)).toEqual(['a', 'b']);
		expect(series.map((s) => [s.id, s.count, s.first, s.last])).toEqual([
			['s1', 3, '2026-10-23', '2026-11-06'],
			['s2', 1, '2026-10-24', '2026-10-24']
		]);
		expect(series[0]!.event.startsOn).toBe('2026-10-23');
		expect(series[0]!.rhythm).toBe('freitags');
	});

	it('Zeitraum in Blöcke teilen', () => {
		expect(daysBetween('2026-10-23', '2026-10-30')).toBe(7);
		expect(splitRange('2026-10-19', '2027-10-19')).toEqual([
			{ from: '2026-10-19', to: '2026-12-31' },
			{ from: '2027-01-01', to: '2027-03-31' },
			{ from: '2027-04-01', to: '2027-06-30' },
			{ from: '2027-07-01', to: '2027-09-30' },
			{ from: '2027-10-01', to: '2027-10-19' }
		]);
		expect(splitRange('2025-01-01', '2025-12-31').length).toBe(4);
		expect(splitRange('2026-01-01', '2026-01-01')).toEqual([
			{ from: '2026-01-01', to: '2026-01-01' }
		]);
		expect(splitRange('2026-02-01', '2026-01-01')).toEqual([]);
	});
});
