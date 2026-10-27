import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	// Vite 8 sucht die tsconfig sonst bis zum Repo-Root hoch (Dateien in .svelte-kit/generated
	// stehen nicht im include) und scheitert dort ohne Root-.svelte-kit (CI, frischer Checkout).
	tsconfig: './tsconfig.json',
	plugins: [
		sveltekit(),
		tailwindcss(),
	]
});
