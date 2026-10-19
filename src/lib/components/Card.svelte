<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Mit `href` wird die ganze Karte ein Link (mit Hover-Effekt) */
		href?: string | null;
		/** HTML-Element ohne `href` */
		element?: 'div' | 'article' | 'section' | 'li';
		/** Innenabstand (Standard `true`); `false` z. B. für Karten mit randlosem Bild oben */
		padded?: boolean;
		/** Barrierefreier Name, wenn die Karte ein Link ist */
		label?: string;
		class?: string;
		children: Snippet;
	}

	let {
		href = null,
		element = 'div',
		padded = true,
		label,
		class: className = '',
		children
	}: Props = $props();

	const base = $derived(
		`block overflow-hidden rounded-card border border-line bg-surface shadow-card ${padded ? 'p-6' : ''} ${className}`
	);
</script>

{#if href}
	<a
		{href}
		aria-label={label}
		class="{base} transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0"
	>
		{@render children()}
	</a>
{:else}
	<svelte:element this={element} class={base}>
		{@render children()}
	</svelte:element>
{/if}
