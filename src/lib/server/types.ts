/**
 * Datenverträge der Website-Endpunkte des Intern-Bereichs (`/api/v1/modules/<modul>/website/…`).
 * Bewusst dupliziert – die Website importiert nichts aus `../src`. Quellen:
 * - `src/lib/modules/events/schemas.ts` (`WebsiteEvent`)
 * - `src/lib/modules/galleries/schemas.ts` (`WebsiteGallery`, `WebsiteGalleryDetail`, `WebsiteImage`)
 * - `src/lib/modules/offices/schemas.ts` (`WebsiteOffice`, `WebsiteOfficeHolder`)
 * - `src/lib/modules/members/schemas.ts` (`WebsiteGroup`)
 * Bei Änderungen dort hier nachziehen.
 */

// --- events (Scope `events.website.read`) ------------------------------------

export interface WebsiteEvent {
	id: string;
	title: string;
	description: string | null;
	location: string | null;
	/** `#rrggbb` oder `null` */
	color: string | null;
	/** `YYYY-MM-DD` */
	startsOn: string;
	/** `HH:MM` oder `null` (ganztägig) */
	startsTime: string | null;
	endsOn: string | null;
	endsTime: string | null;
	tags: string[];
	/** Gruppennamen (inkl. Stammesname) */
	groups: string[];
	/** Gruppen-IDs in gleicher Reihenfolge wie `groups` (`stamm` = ganzer Stamm) */
	groupIds: string[];
	/** Teil einer Serie – jedes Vorkommen ist ein eigener Eintrag mit gleicher `id` */
	recurring: boolean;
	/** Serie: ursprüngliches Datum (Schlüssel `id` + `occurrenceDate`) */
	occurrenceDate: string | null;
}

export interface WebsiteEventsQuery {
	/** Standard: heute */
	from?: string;
	to?: string;
	tag?: string;
	/** Gruppen-ID oder `stamm` */
	group?: string;
	/** 1–200, Standard 50 */
	limit?: number;
}

// --- galleries (Scope `galleries.website.read`) -------------------------------

export type WebsiteImageVariant = 'thumb' | 'web';

export interface ImageCover {
	imageId: string;
	width: number;
	height: number;
}

export interface WebsiteEventRef {
	id: string;
	title: string;
	startsOn: string;
	endsOn: string | null;
}

export interface WebsiteGallery {
	id: string;
	title: string;
	description: string | null;
	imageCount: number;
	cover: ImageCover | null;
	events: WebsiteEventRef[];
	/** ISO-Zeitstempel */
	updatedAt: string;
}

export interface WebsiteImage {
	id: string;
	galleryId: string;
	description: string | null;
	width: number;
	height: number;
	position: number;
}

export interface WebsiteGalleryDetail extends WebsiteGallery {
	images: WebsiteImage[];
}

export interface WebsiteGalleryList {
	items: WebsiteGallery[];
	total: number;
}

// --- offices (Scope `offices.website.read`) ------------------------------------

export interface WebsiteOfficeHolder {
	id: string;
	name: string;
	bio: string | null;
	since: string | null;
	/** Relativer API-Pfad des Profilbilds oder `null` */
	avatarPath: string | null;
}

export interface WebsiteOffice {
	id: string;
	name: string;
	description: string | null;
	position: number;
	emails: { label: string | null; email: string }[];
	holders: WebsiteOfficeHolder[];
}

// --- members (Scope `members.website.read`) ------------------------------------

export type GroupType = 'sippe' | 'meute';

export interface WebsiteGroup {
	id: string;
	/** Website-Adresse `/gruppen/<slug>` */
	slug: string;
	name: string;
	type: GroupType;
	description: string | null;
	/** Freitext, z. B. „7 bis 10 Jahre“ */
	ageRange: string | null;
	meetingPlace: string | null;
	/** 1 = Montag … 7 = Sonntag */
	meetingWeekday: number | null;
	/** Beginn der Gruppenstunde `HH:MM` */
	meetingTime: string | null;
	/** Ende der Gruppenstunde `HH:MM` (nur zusammen mit `meetingTime`) */
	meetingEndTime: string | null;
	color: string | null;
	contactEmail: string | null;
	leaders: { firstName: string }[];
	/** Relativer API-Pfad `/api/v1/modules/members/website/groups/<slug>/image?v=…` oder `null` */
	imagePath: string | null;
}
