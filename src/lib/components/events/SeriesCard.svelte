<script lang="ts">
	/**
	 * Kompakte Zeile für eine Terminserie: Titel, Rhythmus, nächster (bzw. im Rückblick letzter)
	 * Termin, Gruppen; Link auf dieses Vorkommen.
	 */
	import type { EventSeries } from '$lib/events';
	import { eventHref } from '$lib/events';
	import { formatDateShort, safeColor } from '$lib/format';

	let { series, review = false }: { series: EventSeries; review?: boolean } = $props();

	const event = $derived(series.event);
	const color = $derived(safeColor(event.color));
	const dateLabel = $derived(
		`${review ? 'letzter Termin' : 'nächster Termin'}: ${formatDateShort(event.startsOn)}`
	);
</script>

<a
	href={eventHref(event)}
	aria-label="{event.title}, {series.rhythm}, {dateLabel}"
	class="group flex h-full items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-card transition hover:border-brand-200 hover:shadow-card-hover motion-reduce:transition-none"
>
	<span
		class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-800"
		aria-hidden="true"
	>
		<svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4"
			/>
		</svg>
	</span>
	<div class="min-w-0 flex-1">
		<p class="flex items-center gap-2">
			{#if color}
				<span
					class="size-2.5 shrink-0 rounded-full"
					style:background-color={color}
					aria-hidden="true"
				></span>
			{/if}
			<span class="truncate font-semibold text-ink group-hover:text-brand-800">{event.title}</span>
		</p>
		<p class="mt-0.5 text-sm text-ink/80 first-letter:uppercase">{series.rhythm}</p>
		<p class="mt-0.5 text-sm text-muted">
			{dateLabel}{#if event.location}<span> · {event.location}</span>{/if}
		</p>
		{#if event.groups.length > 0}
			<ul class="mt-2 flex flex-wrap gap-1.5" aria-label="Gruppen">
				{#each event.groups as group, i (`${event.groupIds[i] ?? group}:${i}`)}
					<li class="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-900">
						{group}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</a>
