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

export interface SiteTeamMember {
	id: string;
	/** Nur Vorname */
	firstName: string;
	bio: string | null;
	/** `YYYY-MM-DD` oder `null` */
	since: string | null;
	/** Profilbild über den Bild-Proxy oder `null` */
	imageUrl: string | null;
}

export interface SiteOffice {
	id: string;
	name: string;
	description: string | null;
	emails: { label: string | null; email: string }[];
	holders: SiteTeamMember[];
}

// --- Inhalte (Modul `website`): Banner, häufige Fragen, Blog ---------------------------------------

export interface SiteBanner {
	id: string;
	title: string | null;
	text: string;
	level: 'info' | 'important';
	placement: 'bar' | 'home';
	/** geprüfter Link (relativ `/…`, https/http oder mailto) oder `null` */
	linkUrl: string | null;
	linkLabel: string | null;
	/** Link führt aus der Website hinaus (neuer Tab) */
	linkExternal: boolean;
	dismissible: boolean;
	/** Schlüssel für „geschlossen“ im Browser: `<id>:<updatedAt>` (Änderung zeigt den Hinweis wieder) */
	dismissKey: string;
}

export interface SiteFaq {
	id: string;
	question: string;
	/** serverseitig bereinigtes HTML (`renderRichText`) bzw. maskierter Klartext beim Rückfall */
	answerHtml: string;
	featured: boolean;
}

export interface SitePostImage {
	url: string;
	width: number;
	height: number;
	alt: string;
}

export interface SitePostSummary {
	slug: string;
	/** `/blog/<slug>` */
	href: string;
	title: string;
	teaser: string | null;
	/** Veröffentlichung als Kalendertag `YYYY-MM-DD` (Europe/Berlin) */
	publishedOn: string;
	/** Zeitpunkt (ISO) für RSS/OG */
	publishedAt: string;
	/** Titelbild (`thumb`) über den Bild-Proxy */
	cover: SitePostImage | null;
	tags: string[];
	/** nur Vorname bzw. eingetragene Anzeige */
	authorName: string | null;
}

export interface SiteTagCount {
	tag: string;
	count: number;
}

export interface SitePostPage {
	items: SitePostSummary[];
	total: number;
	tags: SiteTagCount[];
	/** aktuelle Seite (ab 1) und Seitenzahl */
	page: number;
	pages: number;
}

export interface SitePost extends SitePostSummary {
	/** Titelbild groß (`web`) */
	coverLarge: SitePostImage | null;
	/** serverseitig bereinigtes HTML (`renderRichText`) */
	bodyHtml: string;
	/** nur Gruppen, die auf der Website stehen */
	groups: SiteGroupRef[];
	/** verknüpfter Termin, nur wenn er auf der Terminseite steht */
	event: { key: string; title: string; startsOn: string } | null;
	/** verknüpfte Galerie, nur wenn sie öffentlich gelistet ist */
	gallery: { id: string; title: string } | null;
	updatedAt: string;
}
