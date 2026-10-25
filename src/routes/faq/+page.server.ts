import type { PageServerLoad } from './$types';
import { loadFaqs } from '$lib/server/faqs';

export const prerender = false;

// Alle aktiven Fragen aus dem Intern-Bereich (Rückfall: feste Fragen aus `lib/faqs.ts`)
export const load: PageServerLoad = async () => ({ faqs: await loadFaqs() });
