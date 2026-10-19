<script lang="ts">
	/**
	 * Karte einer Terminserie: Titel, Rhythmus, nächster (bzw. im Rückblick letzter) Termin,
	 * Ort und Gruppen; Link auf dieses Vorkommen.
	 */
	import type { EventSeries } from '$lib/events';
	import { contrastText, eventHref } from '$lib/events';
	import { formatDateShort, safeColor } from '$lib/format';

	let { series, review = false }: { series: EventSeries; review?: boolean } = $props();

	const event = $derived(series.event);
	const color = $derived(safeColor(event.color));
	const dateLabel = $derived(
		`${review ? 'Letzter Termin' : 'Nächster Termin'}: ${formatDateShort(event.startsOn)}`
	);
</script>

<a
	href={eventHref(event)}
	class="card card-hover group relative flex h-full flex-col overflow-hidden p-5 pl-6"
	style:--series-color={color ?? 'var(--color-brand-600)'}
>
	<span class="series-bar absolute inset-y-0 left-0 w-1.5" aria-hidden="true"></span>
	<p class="flex items-center gap-1.5 text-sm font-semibold text-brand-700 first-letter:uppercase">
		<svg
			class="size-4 shrink-0"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			aria-hidden="true"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="M4 12a8 8 0 0 1 14-5.3M20 4v4h-4" />
			<path stroke-linecap="round" stroke-linejoin="round" d="M20 12a8 8 0 0 1-14 5.3M4 20v-4h4" />
		</svg>
		<span>{series.rhythm}</span>
	</p>
	<h3
		class="mt-2 text-lg leading-snug font-bold text-ink transition-colors group-hover:text-brand-700"
	>
		{event.title}
	</h3>
	<p class="mt-1 mb-3 text-sm text-muted">
		{dateLabel}{#if event.location}<span>&nbsp;· {event.location}</span>{/if}
	</p>
	{#if event.groups.length > 0}
		<ul class="mt-auto flex flex-wrap gap-1.5" aria-label="Gruppen">
			{#each event.groups as group, i (`${event.groupIds[i] ?? group}:${i}`)}
				<li
					class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
					style:background-color={color ?? 'var(--color-soft)'}
					style:color={color ? contrastText(color) : 'var(--color-ink)'}
				>
					{group}
				</li>
			{/each}
		</ul>
	{/if}
</a>

<style>
	.series-bar {
		background-color: var(--series-color);
	}
</style>
