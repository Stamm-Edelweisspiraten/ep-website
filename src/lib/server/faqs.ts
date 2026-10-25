/**
 * Häufige Fragen: aus dem Intern-Bereich (Modul `website`), bei Ausfall bzw. ohne aktives Modul Rückfall auf die
 * festen Fragen in `lib/faqs.ts` (Antwort dort als Klartext → maskiert als Absatz).
 */
import { faqs as staticFaqs } from '../faqs';
import type { SiteFaq } from '../site-types';
import { fetchFaqs } from './backend';
import { textToHtml } from './rich-text';

const FALLBACK: SiteFaq[] = staticFaqs.map((f) => ({
	id: `fest-${f.id}`,
	question: f.question,
	answerHtml: textToHtml(f.answer),
	featured: true
}));

export async function loadFaqs(): Promise<SiteFaq[]> {
	try {
		return await fetchFaqs();
	} catch {
		return FALLBACK;
	}
}
