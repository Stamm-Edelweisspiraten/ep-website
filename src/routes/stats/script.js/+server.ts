// Umami-Tracker über die eigene Domain (siehe `lib/server/umami.ts`, `umami-proxy.ts`).
import { scriptProxy } from '$lib/server/umami-proxy';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = scriptProxy('script.js');
