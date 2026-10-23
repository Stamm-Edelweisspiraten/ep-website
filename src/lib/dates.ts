/**
 * Datums- und Zeitformate der Website (rein, Server und Browser).
 *
 * Termine kommen als Kalendertag `YYYY-MM-DD` plus optionaler Uhrzeit `HH:MM` – gerechnet wird nur mit diesen
 * Strings bzw. in UTC, nie mit der Lokalzeit von Server oder Browser (sonst verschieben sich Tage).
 */

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^\d{2}:\d{2}/;

const berlinDay = new Intl.DateTimeFormat('en-CA', {
	timeZone: 'Europe/Berlin',
	year: 'numeric',
	month: '2-digit',
	day: '2-digit'
});

/** „Heute“ als `YYYY-MM-DD` in Europe/Berlin. */
export function todayBerlin(now: Date = new Date()): string {
	const parts = berlinDay.formatToParts(now);
	const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
	return `${get('year')}-${get('month')}-${get('day')}`;
}

function utc(date: string): Date | null {
	const m = DATE_RE.exec(date);
	if (!m) return null;
	return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
}

function fmt(date: string, options: Intl.DateTimeFormatOptions): string {
	const d = utc(date);
	return d ? new Intl.DateTimeFormat('de-DE', { ...options, timeZone: 'UTC' }).format(d) : date;
}

export function time(value: string | null | undefined): string {
	return value && TIME_RE.test(value) ? value.slice(0, 5) : '';
}

/** „Fr, 14. Nov. 2026“ */
export function formatDate(date: string): string {
	return fmt(date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

/** „Freitag, 14. November 2026“ */
export function formatLongDate(date: string): string {
	return fmt(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/** „14.11.2026“ */
export function formatNumericDate(date: string): string {
	return DATE_RE.test(date) ? `${date.slice(8, 10)}.${date.slice(5, 7)}.${date.slice(0, 4)}` : date;
}

/** „November 2026“ */
export function formatMonth(date: string): string {
	return fmt(`${date.slice(0, 7)}-01`, { month: 'long', year: 'numeric' });
}

/** Wochentag kurz („Fr“) und Tag („14“) für den Datumsblock. */
export function dayParts(date: string): { weekday: string; day: string; month: string } {
	return {
		weekday: fmt(date, { weekday: 'short' }).replace('.', ''),
		day: String(Number(date.slice(8, 10)) || ''),
		month: fmt(date, { month: 'short' })
	};
}

/** „Freitag“ (für Serien: „jeden Freitag“) */
export function weekdayName(date: string): string {
	return fmt(date, { weekday: 'long' });
}

/** Uhrzeit eines Termins: „16:30–18:00 Uhr“, „ab 16:30 Uhr“ oder leer. */
export function formatTimeRange(
	startsTime: string | null | undefined,
	endsTime: string | null | undefined,
	multiDay = false
): string {
	const s = time(startsTime);
	const e = time(endsTime);
	if (!s) return '';
	if (multiDay) return `ab ${s} Uhr`;
	return e ? `${s}–${e} Uhr` : `${s} Uhr`;
}

export interface DateRangeInput {
	startsOn: string;
	startsTime?: string | null;
	endsOn?: string | null;
	endsTime?: string | null;
}

export function isMultiDay(r: DateRangeInput): boolean {
	return !!r.endsOn && r.endsOn > r.startsOn;
}

/** Datum ohne Uhrzeit: „Fr, 14. Nov. 2026“, „14.–16. Nov. 2026“, „30. Okt. – 2. Nov. 2026“ */
export function formatDateRange(r: DateRangeInput): string {
	if (!isMultiDay(r)) return formatDate(r.startsOn);
	const end = r.endsOn!;
	const sameYear = r.startsOn.slice(0, 4) === end.slice(0, 4);
	const sameMonth = sameYear && r.startsOn.slice(5, 7) === end.slice(5, 7);
	const endText = fmt(end, { day: 'numeric', month: 'short', year: 'numeric' });
	if (sameMonth) return `${Number(r.startsOn.slice(8, 10))}.–${endText}`;
	if (sameYear) return `${fmt(r.startsOn, { day: 'numeric', month: 'short' })} – ${endText}`;
	return `${fmt(r.startsOn, { day: 'numeric', month: 'short', year: 'numeric' })} – ${endText}`;
}

/** Datum mit Uhrzeit: „Fr, 14. Nov. 2026 · 16:30–18:00 Uhr“; mehrtägig mit Beginn-/Endzeit. */
export function formatWhen(r: DateRangeInput): string {
	if (isMultiDay(r)) {
		const s = time(r.startsTime);
		const e = time(r.endsTime);
		const range = formatDateRange(r);
		if (s && e) return `${range} · ${s} bis ${e} Uhr`;
		return s ? `${range} · ab ${s} Uhr` : range;
	}
	const t = formatTimeRange(r.startsTime, r.endsTime);
	return t ? `${formatDate(r.startsOn)} · ${t}` : formatDate(r.startsOn);
}

/** Letzter Tag eines Termins (für „vergangen“). */
export function lastDay(r: DateRangeInput): string {
	return isMultiDay(r) ? r.endsOn! : r.startsOn;
}
