<script lang="ts">
	/**
	 * Kontaktkasten wie auf der alten Website: Balken links (`border-l-4`) und helle Fläche in der
	 * Gruppen- bzw. Amtsfarbe, Überschrift in kräftiger Variante derselben Farbe.
	 */
	import type { Snippet } from 'svelte';
	import { safeColor } from '$lib/format';

	interface Props {
		title: string;
		/** `#rrggbb`; ungültig/leer → Indigo wie der Schriftzug der alten Website */
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

	const accent = $derived(safeColor(color) ?? '#4338ca');
</script>

<div class="contact-box border-l-4 p-4 sm:p-5 {className}" style:--box-color={accent}>
	<svelte:element this={heading} class="box-title text-xl font-bold">{title}</svelte:element>
	{#if subtitle}{@render subtitle()}{/if}
	<div class="text-gray-700">
		{@render children()}
	</div>
</div>

<style>
	/* Helle Varianten der Farbe wie border-green-400 / bg-green-50 / text-green-700 */
	.contact-box {
		border-left-color: color-mix(in srgb, var(--box-color) 65%, white);
		background-color: color-mix(in srgb, var(--box-color) 7%, white);
	}
	.box-title {
		color: color-mix(in srgb, var(--box-color) 80%, black);
	}
</style>
