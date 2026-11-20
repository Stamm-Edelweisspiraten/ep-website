// Einstellungen des Umami-Recorders (nur für unsere Website-ID).
import { recorderSettingsProxy } from '$lib/server/umami-proxy';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ params }) => recorderSettingsProxy(params.id);
