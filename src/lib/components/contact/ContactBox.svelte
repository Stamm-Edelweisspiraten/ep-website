<script lang="ts">
	/**
	 * Kontaktkasten: Karte mit Farbbalken links und sehr heller Fläche in der Gruppen- bzw. Amtsfarbe,
	 * Überschrift in kräftiger Variante derselben Farbe.
	 */
	import type { Snippet } from 'svelte';
	import { safeColor } from '$lib/format';

	interface Props {
		title: string;
		/** `#rrggbb`; ungültig/leer → Wappenblau */
		color?: string | null;
		heading?: 'h2' | 'h3';
		/** Kleiner Zusatz unter der Überschrift (z. B. Gruppenname als Link) */
		subtitle?: Snippet;
		children: Snippet;
		class?: string;
	}

	let {
		title,
		color = null,
		heading = 'h3',
		subtitle,
		children,
		class: className = ''
	}: Props = $props();

	const accent = $derived(safeColor(color) ?? '#3f42a6');
</script>

<div
	class="contact-box rounded-card border border-l-[6px] p-5 shadow-card sm:p-6 {className}"
	style:--box-color={accent}
>
	<svelte:element this={heading} class="box-title text-xl font-bold">{title}</svelte:element>
	{#if subtitle}{@render subtitle()}{/if}
	<div class="text-gray-700">
		{@render children()}
	</div>
</div>

<style>
	/* Helle Varianten der Farbe */
	.contact-box {
		border-color: var(--color-line);
		border-left-color: var(--box-color);
		background-color: color-mix(in srgb, var(--box-color) 4%, white);
	}
	.box-title {
		color: color-mix(in srgb, var(--box-color) 80%, black);
	}
</style>
