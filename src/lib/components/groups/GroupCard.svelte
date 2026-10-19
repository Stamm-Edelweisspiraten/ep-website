<script lang="ts">
	import { formatMeeting, safeColor } from '$lib/format';
	import type { WebsiteGroup } from '$lib/server/types';
	import { GROUP_TYPE_LABELS, GROUP_TYPE_LEADS } from './groups';

	interface Props {
		group: WebsiteGroup;
		/** Überschriften-Ebene (Standard `h3`) */
		heading?: 'h2' | 'h3';
	}

	let { group, heading = 'h3' }: Props = $props();

	/** Ohne Gruppenfarbe: Indigo wie der Schriftzug der alten Website */
	const FALLBACK_COLOR = '#4338ca';

	const color = $derived(safeColor(group.color) ?? FALLBACK_COLOR);
	const meeting = $derived(
		formatMeeting(group.meetingWeekday, group.meetingTime, group.meetingEndTime)
	);
	const typeLabel = $derived(GROUP_TYPE_LABELS[group.type] ?? 'Gruppe');
	const title = $derived(group.ageRange ? `${typeLabel} (${group.ageRange})` : typeLabel);
	const details = $derived([meeting, group.meetingPlace].filter(Boolean).join(' · '));
</script>

<!-- Wie die Gruppenkacheln der alten Startseite: volle Breite, Überschrift und Knopf in Gruppenfarbe -->
<article
	class="group-card w-full border border-gray-300 bg-white p-6 transition-shadow hover:shadow-md motion-reduce:transition-none sm:p-8"
	style:--group-color={color}
>
	<svelte:element this={heading} class="group-title text-2xl font-bold">
		{title}
		<span class="mt-1 block text-lg font-semibold text-gray-800">{group.name}</span>
	</svelte:element>
	<p class="mt-2 text-gray-700">{GROUP_TYPE_LEADS[group.type] ?? ''}</p>
	{#if details}
		<p class="mt-4 text-sm text-gray-500">{details}</p>
	{/if}
	<a
		href="/gruppen/{group.slug}"
		class="group-button mt-4 inline-block rounded border px-4 py-2 font-medium transition-colors motion-reduce:transition-none"
	>
		Mehr zur {typeLabel}<span class="sr-only"> {group.name}</span>
		<span aria-hidden="true">→</span>
	</a>
</article>

<style>
	/* Helle Varianten der Gruppenfarbe (wie bg-green-100 / border-green-300 / text-green-700) */
	.group-title,
	.group-button {
		color: color-mix(in srgb, var(--group-color) 80%, black);
	}
	.group-title > span {
		color: var(--color-gray-800);
	}
	.group-button {
		background-color: color-mix(in srgb, var(--group-color) 12%, white);
		border-color: color-mix(in srgb, var(--group-color) 40%, white);
	}
	.group-button:hover {
		background-color: color-mix(in srgb, var(--group-color) 22%, white);
	}
</style>
