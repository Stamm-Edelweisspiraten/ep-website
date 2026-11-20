// Pakete des Umami-Recorders (Aufzeichnung, Heatmap) an die Umami-Instanz weiterreichen.
import { forwardPost } from '$lib/server/umami-proxy';
import { isOwnRecording } from '$lib/server/umami';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ request, getClientAddress }) =>
	forwardPost(request, getClientAddress, '/api/record', isOwnRecording);
