/**
 * Serverseitiger Zugriff auf die Website-Endpunkte des Intern-Bereichs.
 * Der API-Key (`INTERN_API_KEY`) verlässt den Server nie – Bilder laufen über `/bilder/…`.
 */
import { env } from '$env/dynamic/private';
import {
	createInternClient,
	orNull,
	type InternClient,
	type JsonOptions,
	type Query
} from './intern-client';
import type {
	WebsiteEvent,
	WebsiteEventsQuery,
	WebsiteGalleryDetail,
	WebsiteGalleryList,
	WebsiteGroup,
	WebsiteOffice
} from './types';

export { InternApiError, safe, type SafeResult, type BinaryResult } from './intern-client';

let client: InternClient | null = null;
let clientKey = '';

function getClient(): InternClient {
	const key = `${env.INTERN_API_URL ?? ''}|${env.INTERN_API_KEY ?? ''}|${env.INTERN_CACHE_TTL ?? ''}`;
	if (!client || key !== clientKey) {
		const ttlSeconds = Number(env.INTERN_CACHE_TTL);
		client = createInternClient({
			baseUrl: env.INTERN_API_URL,
			apiKey: env.INTERN_API_KEY,
			ttlMs: Number.isFinite(ttlSeconds) && ttlSeconds >= 0 ? ttlSeconds * 1000 : undefined
		});
		clientKey = key;
	}
	return client;
}

/** `true`, wenn URL und Key gesetzt sind. */
export function internConfigured(): boolean {
	return getClient().configured;
}

export function internJson<T>(path: string, query?: Query, opts?: JsonOptions): Promise<T> {
	return getClient().internJson<T>(path, query, opts);
}

export function internBinary(path: string, query?: Query) {
	return getClient().internBinary(path, query);
}

const EVENTS = '/api/v1/modules/events/website/events';
const GALLERIES = '/api/v1/modules/galleries/website/galleries';
const OFFICES = '/api/v1/modules/offices/website/offices';
const GROUPS = '/api/v1/modules/members/website/groups';

const seg = encodeURIComponent;

// --- Termine -----------------------------------------------------------------

export function listEvents(q: WebsiteEventsQuery = {}): Promise<WebsiteEvent[]> {
	return internJson<WebsiteEvent[]>(EVENTS, { ...q });
}

/** Einzelner Termin; bei Serien mit `occurrence` (`YYYY-MM-DD`). `null`, wenn unbekannt. */
export function getEvent(id: string, occurrence?: string | null): Promise<WebsiteEvent | null> {
	return orNull(internJson<WebsiteEvent>(`${EVENTS}/${seg(id)}`, { occurrence }));
}

// --- Galerien ----------------------------------------------------------------

export interface GalleriesQuery {
	eventId?: string;
	limit?: number;
	offset?: number;
}

export function listGalleries(q: GalleriesQuery = {}): Promise<WebsiteGalleryList> {
	return internJson<WebsiteGalleryList>(GALLERIES, { ...q });
}

export function getGallery(id: string): Promise<WebsiteGalleryDetail | null> {
	return orNull(internJson<WebsiteGalleryDetail>(`${GALLERIES}/${seg(id)}`));
}

export function galleryImagePath(galleryId: string, imageId: string, variant: 'thumb' | 'web') {
	return `${GALLERIES}/${seg(galleryId)}/images/${seg(imageId)}/${variant}`;
}

// --- Ämter -------------------------------------------------------------------

export function listOffices(): Promise<WebsiteOffice[]> {
	return internJson<WebsiteOffice[]>(OFFICES);
}

export function officeAvatarPath(userId: string) {
	return `${OFFICES}/holders/${seg(userId)}/avatar`;
}

// --- Gruppen -----------------------------------------------------------------

export function listGroups(): Promise<WebsiteGroup[]> {
	return internJson<WebsiteGroup[]>(GROUPS);
}

export function getGroup(slug: string): Promise<WebsiteGroup | null> {
	return orNull(internJson<WebsiteGroup>(`${GROUPS}/${seg(slug)}`));
}

export function groupImagePath(slug: string) {
	return `${GROUPS}/${seg(slug)}/image`;
}
