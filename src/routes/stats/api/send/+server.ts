// Ereignisse des Umami-Trackers serverseitig an die Umami-Instanz weiterreichen (siehe `lib/server/umami-proxy.ts`).
import { forwardPost } from '$lib/server/umami-proxy';
import { isOwnEvent } from '$lib/server/umami';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ request, getClientAddress }) =>
	forwardPost(request, getClientAddress, '/api/send', isOwnEvent);
