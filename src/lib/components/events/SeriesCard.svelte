<script lang="ts">
	/**
	 * Karte einer Terminserie im Stil der alten Website: Titel, Rhythmus, nächster (bzw. im
	 * Rückblick letzter) Termin, Ort und Gruppen; Link auf dieses Vorkommen.
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
	class="group flex h-full flex-col border border-gray-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
>
	<h3 class="text-lg leading-snug font-semibold text-gray-900 group-hover:text-blue-700">
		{event.title}
	</h3>
	<p class="mt-0.5 text-sm font-medium text-gray-700 first-letter:uppercase">{series.rhythm}</p>
	<p class="mb-2 text-sm text-gray-500">
		{dateLabel}{#if event.location}<span>&nbsp;· {event.location}</span>{/if}
	</p>
	{#if event.groups.length > 0}
		<ul class="mt-auto flex flex-wrap gap-2 pt-1" aria-label="Gruppen">
			{#each event.groups as group, i (`${event.groupIds[i] ?? group}:${i}`)}
				<li
					class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
					style:background-color={color ?? '#e5e7eb'}
					style:border-color={color ?? '#e5e7eb'}
					style:color={contrastText(color ?? '#e5e7eb')}
				>
					{group}
				</li>
			{/each}
		</ul>
	{/if}
</a>
