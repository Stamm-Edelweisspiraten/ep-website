import { env as publicEnv } from '$env/dynamic/public';
import { env } from '$env/dynamic/private';
import { cleanBase } from '../seo';

/** Öffentliche Basis-URL der Website: `PUBLIC_SITE_URL`, sonst `ORIGIN`, sonst die Adresse der Anfrage. */
export function siteBase(url: URL): string {
	return cleanBase(publicEnv.PUBLIC_SITE_URL || env.ORIGIN || url.origin);
}
