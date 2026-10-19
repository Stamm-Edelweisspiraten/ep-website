<script lang="ts">
	/**
	 * Karte eines Termins (Link zur Detailseite): Datums-Kachel, Titel, Datum/Uhrzeit,
	 * Beschreibung (gekürzt), Ort, Gruppen in der Terminfarbe und Tags als Chips.
	 * `compact` für die Vorschau auf anderen Seiten: ohne Ort und Tags, kürzere Beschreibung.
	 * Vergangene Termine erscheinen blass.
	 */
	import type { WebsiteEvent } from '$lib/server/types';
	import { contrastText, eventHref, formatEventDate, isPastEvent } from '$lib/events';
	import { safeColor } from '$lib/format';
	import DateBadge from './DateBadge.svelte';

	let {
		event,
		compact = false,
		headingLevel = 'h3'
	}: { event: WebsiteEvent; compact?: boolean; headingLevel?: 'h2' | 'h3' } = $props();

	const color = $derived(safeColor(event.color));
	const date = $derived(formatEventDate(event));
	const past = $derived(isPastEvent(event));
</script>

<a
	href={eventHref(event)}
	class="card card-hover group flex h-full gap-4 p-4 sm:p-5 {past
		? 'opacity-70 hover:opacity-100'
		: ''}"
>
	<DateBadge date={event.startsOn} />

	<div class="flex min-w-0 flex-1 flex-col">
		<svelte:element
			this={headingLevel}
			class="leading-snug font-bold text-ink transition-colors group-hover:text-brand-700 {compact
				? 'line-clamp-2 text-base'
				: 'text-lg'}"
		>
			{event.title}
		</svelte:element>

		<p class="mt-0.5 text-sm text-muted">
			<time datetime={event.startsOn}>{date}</time>
			{#if event.recurring}<span> · regelmäßig</span>{/if}
		</p>

		{#if event.description}
			<p
				class="mt-2 text-sm leading-relaxed text-gray-600 {compact
					? 'line-clamp-2'
					: 'line-clamp-3'}"
			>
				{event.description}
			</p>
		{/if}

		{#if !compact && event.location}
			<p class="mt-2 flex items-center gap-1.5 text-sm text-muted">
				<svg
					class="size-4 shrink-0"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					aria-hidden="true"
				>
					<path
						stroke-linejoin="round"
						d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"
					/>
					<circle cx="12" cy="9.5" r="2.5" />
				</svg>
				<span class="truncate">{event.location}</span>
			</p>
		{/if}

		{#if event.groups.length > 0 || (!compact && event.tags.length > 0)}
			<ul class="mt-auto flex flex-wrap items-center gap-1.5 pt-3" aria-label="Gruppen und Tags">
				{#each event.groups as group, i (`g:${event.groupIds[i] ?? group}:${i}`)}
					<li
						class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
						style:background-color={color ?? 'var(--color-soft)'}
						style:color={color ? contrastText(color) : 'var(--color-ink)'}
					>
						{group}
					</li>
				{/each}
				{#if !compact}
					{#each event.tags as tag (`t:${tag}`)}
						<li class="chip">{tag}</li>
					{/each}
				{/if}
			</ul>
		{/if}
	</div>
</a>
