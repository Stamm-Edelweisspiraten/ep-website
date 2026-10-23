/**
 * Bild-Proxy mit Cache: Galerie- und Gruppenbilder werden je Cache-Dauer nur einmal beim Backend geholt
 * (siehe `image-cache.ts`). Umgebung: `IMAGE_CACHE_MB` (Standard 48, 0 = aus), `IMAGE_CACHE_TTL_SEC` (Standard 3600).
 */
import { env } from '$env/dynamic/private';
import {
	fetchGroupImage,
	fetchGroups,
	fetchImage,
	fetchTeamAvatar,
	isKnownGalleryImage,
	teamAvatarVersion
} from './backend';
import { createImageCache, readImage, type CachedImage } from './image-cache';

function numberEnv(value: string | undefined, fallback: number, max: number) {
	const n = Number(value);
	return value !== undefined && value !== '' && Number.isFinite(n) && n >= 0
		? Math.min(n, max)
		: fallback;
}

const cache = createImageCache({
	ttlMs: numberEnv(env.IMAGE_CACHE_TTL_SEC, 3600, 86_400) * 1000,
	notFoundTtlMs: 60_000,
	maxBytes: numberEnv(env.IMAGE_CACHE_MB, 48, 1024) * 1024 * 1024
});

export function galleryImage(
	galleryId: string,
	imageId: string,
	variant: 'thumb' | 'web'
): Promise<CachedImage | null> {
	return cache.get(`g:${galleryId}:${imageId}:${variant}`, async () => {
		// unbekannte Bilder gar nicht erst beim Backend anfragen (Galerie-Daten liegen im JSON-Cache)
		if (!(await isKnownGalleryImage(galleryId, imageId))) return null;
		return readImage(await fetchImage(galleryId, imageId, variant));
	});
}

/**
 * Gruppenbild je Slug und aktueller Version (`?v=` aus dem `imagePath` des Backends, neues Bild → neuer Schlüssel).
 * Unbekannte Slugs bzw. Gruppen ohne eigenes Bild → `null` ohne Backend-Abruf (Gruppenliste liegt im JSON-Cache);
 * die `?v=` der Anfrage zählt nicht, damit zufällige Werte keinen Abruf auslösen.
 */
export async function groupImage(slug: string): Promise<CachedImage | null> {
	const groups = await fetchGroups(); // ohne Backend leer → dann direkt fragen
	const group = groups.find((g) => g.slug === slug);
	if (groups.length > 0 && !group?.image?.startsWith('/bilder/gruppe/')) return null;
	const version = new URLSearchParams(group?.image?.split('?')[1] ?? '').get('v') ?? '';
	return cache.get(`s:${slug}:${version}`, async () => readImage(await fetchGroupImage(slug)));
}

/**
 * Profilbild einer Person aus „Unser Team“ je aktueller Version. Nur Personen, die mit Bild in der Ämterliste stehen
 * (also der Anzeige zugestimmt haben), erreichen das Backend; andere IDs → `null` ohne Abruf.
 */
export async function teamImage(userId: string): Promise<CachedImage | null> {
	const version = await teamAvatarVersion(userId);
	if (version === null) return null;
	return cache.get(`t:${userId}:${version}`, async () => readImage(await fetchTeamAvatar(userId)));
}
