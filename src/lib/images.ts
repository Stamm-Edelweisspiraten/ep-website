/**
 * Bild-URLs der Website (Client-sicher). Alle Bilder laufen über die eigenen Proxys unter
 * `/bilder/…`, damit der API-Key auf dem Server bleibt.
 */
import type { WebsiteGroup, WebsiteImageVariant, WebsiteOfficeHolder } from './server/types';

/** Gallery-, Bild- und Benutzer-IDs (UUIDs bzw. Better-Auth-IDs) */
export const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
/** Gruppen-Slugs wie im Intern-Bereich (`GROUP_SLUG_PATTERN`, ≤ 60 Zeichen) */
export const SLUG_PATTERN = /^(?=.{1,60}$)[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Cache-Busting-Wert `?v=` */
export const VERSION_PATTERN = /^[A-Za-z0-9._-]{1,64}$/;

export function isId(value: string | null | undefined): value is string {
	return typeof value === 'string' && ID_PATTERN.test(value);
}

export function isSlug(value: string | null | undefined): value is string {
	return typeof value === 'string' && SLUG_PATTERN.test(value);
}

/** Version aus einem relativen API-Pfad (`…?v=123`) – nur gültige Werte. */
export function versionOf(path: string | null | undefined): string | null {
	if (!path) return null;
	const index = path.indexOf('?');
	if (index < 0) return null;
	const v = new URLSearchParams(path.slice(index + 1)).get('v');
	return v && VERSION_PATTERN.test(v) ? v : null;
}

export function galleryImageUrl(
	galleryId: string,
	imageId: string,
	variant: WebsiteImageVariant = 'web'
): string {
	return `/bilder/galerie/${encodeURIComponent(galleryId)}/${encodeURIComponent(imageId)}/${variant}`;
}

/** Profilbild einer Inhaberin/eines Inhabers oder `null`, wenn keins hinterlegt ist. */
export function officeAvatarUrl(holder: Pick<WebsiteOfficeHolder, 'id' | 'avatarPath'>) {
	if (!holder.avatarPath) return null;
	const v = versionOf(holder.avatarPath);
	return `/bilder/amt/${encodeURIComponent(holder.id)}${v ? `?v=${encodeURIComponent(v)}` : ''}`;
}

/** Gruppenbild oder `null`; übernimmt `?v=` aus `imagePath` für Cache-Busting. */
export function groupImageUrl(group: Pick<WebsiteGroup, 'slug' | 'imagePath'>) {
	if (!group.imagePath) return null;
	const v = versionOf(group.imagePath);
	return `/bilder/gruppe/${encodeURIComponent(group.slug)}${v ? `?v=${encodeURIComponent(v)}` : ''}`;
}
