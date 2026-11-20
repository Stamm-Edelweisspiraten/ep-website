// Umami-Recorder (Sitzungsaufzeichnung/Heatmaps) über die eigene Domain. Geladen nur von `Analytics.svelte`
// (nicht bei Widerspruch oder „Do Not Track“, das prüft der Recorder selbst nicht).
import { scriptProxy } from '$lib/server/umami-proxy';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = scriptProxy('recorder.js');
