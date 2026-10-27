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
	/** Anzeigetext, z. B. „7 bis 10 Jahre“ oder „ab 11 Jahren“ */
	ageRange: string | null;
	/** Alter von/bis in Jahren (`null` = ohne Grenze bzw. ohne Angabe) */
	ageMin: number | null;
	ageMax: number | null;
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

export interface BackendOfficeHolder {
	/** Stabile ID für Avatar-Abruf (`/website/offices/holders/:userId/avatar`) */
	id: string;
	/** Nur der Vorname (erstes Wort des Kontonamens) – Nachnamen verlassen den Server nicht */
	firstName: string;
	bio: string | null;
	since: string | null;
	/** Relativer API-Pfad des Profilbilds oder `null` ohne Bild */
	avatarPath: string | null;
}

/** Amt mit Inhaber*innen, die der Anzeige auf der Website zugestimmt haben */
export interface BackendOffice {
	id: string;
	name: string;
	description: string | null;
	position: number;
	emails: { label: string | null; email: string }[];
	holders: BackendOfficeHolder[];
}

// --- Inhalte der Website (Modul `website`, Scope `website.content.read`) -------------------------

/** Laufender Banner/Hinweis: `bar` = Leiste auf allen Seiten, `home` = Kasten auf der Startseite */
export interface BackendBanner {
	id: string;
	title: string | null;
	text: string;
	level: 'info' | 'important';
	placement: 'bar' | 'home';
	/** relativ `/…` oder https/mailto */
	linkUrl: string | null;
	linkLabel: string | null;
	dismissible: boolean;
	updatedAt: string;
}

export interface BackendFaq {
	id: string;
	question: string;
	/** bereinigtes HTML (einfache Formatierung, Links) */
	answerHtml: string;
	/** auch auf der Startseite zeigen */
	featured: boolean;
}

export interface BackendPostImage {
	id: string;
	width: number;
	height: number;
	alt: string | null;
}

export interface BackendPostSummary {
	slug: string;
	title: string;
	teaser: string | null;
	publishedAt: string;
	cover: BackendPostImage | null;
	tags: string[];
	/** nur Vorname bzw. die eingetragene Anzeige */
	authorName: string | null;
}

export interface BackendTagCount {
	tag: string;
	count: number;
}

/** Antwort von `GET /website/posts` */
export interface BackendPostPage {
	items: BackendPostSummary[];
	total: number;
	tags: BackendTagCount[];
}

export interface BackendPost extends BackendPostSummary {
	/** bereinigtes HTML; Bilder als `<img data-image-id="…" alt="…">` (Maße in `images`) */
	bodyHtml: string;
	images: BackendPostImage[];
	groupIds: string[];
	eventId: string | null;
	galleryId: string | null;
	updatedAt: string;
}
