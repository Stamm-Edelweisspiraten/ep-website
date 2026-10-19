import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	compilerOptions: { runes: true },
	kit: {
		adapter: adapter({ out: 'build' }),
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'script-src': ['self'],
				// Leaflet setzt Inline-Styles für Kacheln und Marker
				'style-src': ['self', 'unsafe-inline'],
				'img-src': ['self', 'data:', 'https://*.tile.openstreetmap.org'],
				'font-src': ['self', 'data:'],
				'connect-src': ['self'],
				'frame-src': ['none'],
				'object-src': ['none'],
				'base-uri': ['self'],
				'form-action': ['self', 'https://formsubmit.co'],
				'frame-ancestors': ['none']
			}
		}
	}
};

export default config;
