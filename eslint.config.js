import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

export default ts.config(
	{ ignores: ['build/', '.svelte-kit/', 'node_modules/'] },
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
			],
			'svelte/no-navigation-without-resolve': 'off',
			'svelte/prefer-svelte-reactivity': 'off'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts'],
		languageOptions: { parserOptions: { parser: ts.parser } }
	},
	{
		// Der API-Key bleibt auf dem Server: Client-Code darf $lib/server nicht importieren
		// (SvelteKit prüft das zusätzlich beim Build).
		files: ['src/lib/components/**/*.{ts,svelte}', 'src/lib/*.ts'],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['$lib/server/*', '**/server/intern*'],
							allowTypeImports: true,
							message: 'Client-Code darf nur Typen aus $lib/server importieren.'
						}
					]
				}
			]
		}
	}
);
