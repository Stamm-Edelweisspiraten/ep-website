import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/**
 * Content-Security-Policy (#67, 01b-13). `mode: 'auto'` ergänzt Nonces für SvelteKits eigene Inline-Skripte
 * (alle Seiten werden zur Laufzeit gerendert → Header). Inhalte aus dem Backend sind Freitext – einzige
 * `{@html}`-Stellen sind Blog-Beiträge und Antworten der häufigen Fragen (`FaqList.svelte`, `blog/[slug]`); deren
 * HTML wird vorher serverseitig in `src/lib/server/rich-text.ts` auf eine Whitelist bereinigt (keine Skripte,
 * Ereignis-Attribute oder fremden Bildquellen). Die CSP ist die zweite Verteidigungslinie.
 * - Karten-Kacheln (Zwei-Klick-Karte) von `*.tile.openstreetmap.org`, alles andere vom eigenen Origin
 *   (Bilder laufen über den Proxy `/bilder/…`).
 * - `style-src 'unsafe-inline'`: Svelte-Übergänge und einige `style=`-Attribute; keine Skripte.
 * Weitere Header (X-Frame-Options, Referrer-Policy, HSTS …) setzt `src/hooks.server.ts`.
 */
const csp = {
	mode: 'auto',
	directives: {
		'default-src': ['self'],
		'script-src': ['self'],
		'style-src': ['self', 'unsafe-inline'],
		'img-src': ['self', 'data:', 'blob:', 'https://*.tile.openstreetmap.org'],
		'font-src': ['self', 'data:'],
		'connect-src': ['self'],
		'object-src': ['none'],
		'base-uri': ['self'],
		'form-action': ['self'],
		'frame-ancestors': ['none'],
		'frame-src': ['none']
	}
};

export default {
	kit: {
		adapter: adapter({
			out: 'build'
		}),
		paths: {
			base: ''
		},
		csp
	},
	preprocess: vitePreprocess()
};
