/**
 * Datums- und Zeitformatierung für die Website (de-DE, Zeitzone Europe/Berlin).
 * Daten kommen als `YYYY-MM-DD`, Uhrzeiten als `HH:MM`.
 */

const TZ = 'Europe/Berlin';

const WEEKDAYS = [
	'Montag',
	'Dienstag',
	'Mittwoch',
	'Donnerstag',
	'Freitag',
	'Samstag',
	'Sonntag'
] as const;

/** Feste Kurzformen – ICU liefert je nach Node-Version „Mär“ oder „März“ */
const MONTHS_SHORT = [
	'Jan.',
	'Feb.',
	'März',
	'Apr.',
	'Mai',
	'Juni',
	'Juli',
	'Aug.',
	'Sept.',
	'Okt.',
	'Nov.',
	'Dez.'
] as const;
const WEEKDAYS_SHORT = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'] as const;

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** `YYYY-MM-DD` → Date (Mittag UTC, damit Zeitzonen den Tag nicht verschieben) oder `null`. */
export function parseDate(value: string | null | undefined): Date | null {
	if (!value) return null;
	const m = DATE_RE.exec(value);
	if (!m) return null;
	const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12));
	if (date.getUTCDate() !== Number(m[3])) return null;
	return date;
}

function fmt(date: Date, options: Intl.DateTimeFormatOptions) {
	return new Intl.DateTimeFormat('de-DE', { timeZone: 'UTC', ...options }).format(date);
}

/** „24.12.2026“ */
export function formatDate(value: string | null | undefined): string {
	const date = parseDate(value);
	return date ? fmt(date, { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
}

/** „Donnerstag, 24. Dezember 2026“ */
export function formatDateLong(value: string | null | undefined): string {
	const date = parseDate(value);
	return date ? fmt(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';
}

/** „Do., 24.12.“ – kompakt für Listen */
export function formatDateShort(value: string | null | undefined): string {
	const date = parseDate(value);
	if (!date) return '';
	return `${WEEKDAYS_SHORT[date.getUTCDay()]}, ${fmt(date, { day: '2-digit', month: '2-digit' })}`;
}

/** „Dez.“ / „24“ / „Do.“ – für Datums-Kacheln */
export function dateParts(value: string | null | undefined) {
	const date = parseDate(value);
	if (!date) return null;
	return {
		day: String(date.getUTCDate()),
		month: MONTHS_SHORT[date.getUTCMonth()]!,
		weekday: WEEKDAYS_SHORT[date.getUTCDay()]!,
		year: String(date.getUTCFullYear())
	};
}

/** „16:30“ → „16:30 Uhr“ */
export function formatTime(value: string | null | undefined): string {
	if (!value || !TIME_RE.test(value)) return '';
	return `${value} Uhr`;
}

export interface DateRangeInput {
	startsOn: string;
	startsTime?: string | null;
	endsOn?: string | null;
	endsTime?: string | null;
}

/**
 * Zeitraum eines Termins:
 * - „24.12.2026“ (ganztägig, ein Tag)
 * - „24.12.2026, 16:30 Uhr“ / „24.12.2026, 16:30–18:00 Uhr“
 * - „24.12.–26.12.2026“ (mehrtägig im selben Jahr) / „30.12.2026–02.01.2027“
 * - „24.12.2026, 16:30 Uhr – 26.12.2026, 12:00 Uhr“ (mehrtägig mit Uhrzeiten)
 */
export function formatDateRange(input: DateRangeInput): string {
	const start = parseDate(input.startsOn);
	if (!start) return '';
	const startTime = input.startsTime && TIME_RE.test(input.startsTime) ? input.startsTime : null;
	const endTime = input.endsTime && TIME_RE.test(input.endsTime) ? input.endsTime : null;
	const end = parseDate(input.endsOn ?? null);
	const sameDay = !end || input.endsOn === input.startsOn;

	if (sameDay) {
		const day = formatDate(input.startsOn);
		if (!startTime) return day;
		if (endTime && endTime !== startTime) return `${day}, ${startTime}–${endTime} Uhr`;
		return `${day}, ${startTime} Uhr`;
	}

	if (startTime || endTime) {
		const from = startTime
			? `${formatDate(input.startsOn)}, ${startTime} Uhr`
			: formatDate(input.startsOn);
		const to = endTime ? `${formatDate(input.endsOn)}, ${endTime} Uhr` : formatDate(input.endsOn);
		return `${from} – ${to}`;
	}

	if (start.getUTCFullYear() === end.getUTCFullYear()) {
		return `${fmt(start, { day: '2-digit', month: '2-digit' })}–${formatDate(input.endsOn)}`;
	}
	return `${formatDate(input.startsOn)}–${formatDate(input.endsOn)}`;
}

/** Wochentag 1 = Montag … 7 = Sonntag → „Montag“; ungültig → `''`. */
export function weekdayName(day: number | null | undefined): string {
	if (typeof day !== 'number' || !Number.isInteger(day) || day < 1 || day > 7) return '';
	return WEEKDAYS[day - 1]!;
}

/** Wochentag 1–7 → „montags“ */
export function weekdayAdverb(day: number | null | undefined): string {
	const name = weekdayName(day);
	return name ? `${name.toLowerCase()}s` : '';
}

/**
 * Gruppenstunde: „Freitags 16:30 Uhr“, nur Tag → „Freitags“, nur Zeit → „16:30 Uhr“, nichts → `''`.
 */
export function formatMeeting(
	weekday: number | null | undefined,
	time: string | null | undefined
): string {
	const day = weekdayName(weekday);
	const dayText = day ? `${day}s` : '';
	const timeText = formatTime(time);
	return [dayText, timeText].filter(Boolean).join(' ');
}

/** Heutiges Datum in Berlin als `YYYY-MM-DD`. */
export function todayIso(now: Date = new Date()): string {
	return new Intl.DateTimeFormat('en-CA', {
		timeZone: TZ,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).format(now);
}

const COLOR_RE = /^#[0-9a-f]{6}$/i;

/** Nur `#rrggbb` durchlassen (Farben aus dem Intern-Bereich landen in `style`). */
export function safeColor(value: string | null | undefined): string | undefined {
	return value && COLOR_RE.test(value) ? value : undefined;
}
