/**
 * Datenverträge des Backends (Website-API, siehe docs/api.md → „Stammeswebsite“) – reine Typen.
 *
 * Kopie der DTOs aus den Modulen (`WebsiteEvent`, `WebsiteGallery`, `WebsiteGroup` …). Ein Test im
 * Hauptprojekt (`tests/unit/website-contract.test.ts`) prüft die Typgleichheit mit den Modul-DTOs, damit
 * eine Feldumbenennung im Backend nicht still zu leeren Seiten führt. Bei Änderungen beide Seiten anpassen.
 */

export interface BackendEvent {
	id: string;
	title: string;
	description: string | null;
	location: string | null;
	color: string | null;
	startsOn: string;
	startsTime: string | null;
	endsOn: string | null;
	endsTime: string | null;
	tags: string[];
	groups: string[];
	groupIds: string[];
	recurring: boolean;
	occurrenceDate: string | null;
}

/** Antwort von `GET /website/events?paged=1` */
export interface BackendEventPage {
	items: BackendEvent[];
	total: number;
	offset: number;
	limit: number;
	hasMore: boolean;
}

export interface BackendEventRef {
	id: string;
	title: string;
	startsOn: string;
	endsOn: string | null;
}

export interface BackendGallery {
	id: string;
	title: string;
	description: string | null;
	imageCount: number;
	cover: { imageId: string; width: number; height: number } | null;
	events: BackendEventRef[];
	updatedAt: string;
}

export interface BackendGalleryDetail extends BackendGallery {
	images: {
		id: string;
		galleryId: string;
		description: string | null;
		width: number;
		height: number;
		position: number;
	}[];
}

export interface BackendGroup {
	id: string;
	/** Website-Adresse `/<type>/<slug>` */
	slug: string;
	name: string;
	type: 'meute' | 'sippe';
	/** Website-Text, sonst die interne Beschreibung */
	description: string | null;
	/** Freitext, z. B. „7 bis 10 Jahre“ */
	ageRange: string | null;
	meetingPlace: string | null;
	/** 1 = Montag … 7 = Sonntag */
	meetingWeekday: number | null;
	meetingTime: string | null;
	meetingEndTime: string | null;
	color: string | null;
	contactEmail: string | null;
	leaders: { firstName: string }[];
	/** Relativer API-Pfad des Gruppenbilds oder `null` */
	imagePath: string | null;
}
