/**
 * Form der Termine und Galerien für die Seiten (aus den Backend-DTOs aufbereitet in `server/backend.ts`).
 * Reine Typen, auch im Browser nutzbar.
 */

export interface SiteGroupRef {
	id: string;
	name: string;
	/** `#rrggbb` oder `null` */
	color: string | null;
	/** Gruppenseite `/<type>/<slug>`, wenn die Gruppe auf der Website steht */
	href: string | null;
}

export interface SiteGalleryRef {
	id: string;
	title: string;
	imageCount: number;
	/** Titelbild (`thumb`) über den Bild-Proxy oder `null` */
	coverUrl: string | null;
}

export interface SiteEvent {
	/** Adresse der Termin-Seite: `<id>` bzw. bei Serien `<id>~<YYYY-MM-DD>` */
	key: string;
	id: string;
	title: string;
	description: string;
	location: string | null;
	/** `#rrggbb` oder `null` */
	color: string | null;
	startsOn: string;
	startsTime: string | null;
	endsOn: string | null;
	endsTime: string | null;
	recurring: boolean;
	occurrenceDate: string | null;
	groups: SiteGroupRef[];
	/** Themen-Tags (frei vergeben) */
	tags: string[];
	galleries: SiteGalleryRef[];
}

export interface SiteImage {
	id: string;
	thumbUrl: string;
	webUrl: string;
	width: number;
	height: number;
	description: string | null;
}

export interface SiteGallery {
	id: string;
	title: string;
	description: string;
	imageCount: number;
	cover: { url: string; width: number; height: number } | null;
	/** Frühester verknüpfter Termin, sonst Änderungsdatum (`YYYY-MM-DD`) */
	date: string;
	endDate: string | null;
	events: { key: string; title: string; startsOn: string; endsOn: string | null }[];
	groups: SiteGroupRef[];
}

export interface SiteGalleryDetail extends SiteGallery {
	images: SiteImage[];
}
