<script lang="ts">
	/**
	 * Karte eines Termins wie auf der alten Website (Link zur Detailseite): Titel, Datum,
	 * Beschreibung (gekürzt), Gruppen in der Terminfarbe und Tags als Chips.
	 * `compact` für die Vorschau auf anderen Seiten: Datum als Pille, kleinere Schrift.
	 * Vergangene Termine erscheinen blass (wie früher).
	 */
	import type { WebsiteEvent } from '$lib/server/types';
	import { contrastText, eventHref, formatEventDate, isPastEvent } from '$lib/events';
	import { safeColor } from '$lib/format';

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
	class="group flex h-full flex-col border border-gray-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 {past
		? 'opacity-60 hover:opacity-100'
		: ''}"
>
	<svelte:element
		this={headingLevel}
		class="font-semibold text-gray-900 group-hover:text-blue-700 {compact
			? 'mb-1 line-clamp-2 text-base'
			: 'text-lg leading-snug'}"
	>
		{event.title}
	</svelte:element>

	{#if !compact}
		<p class="mb-2 text-sm text-gray-500">
			<time datetime={event.startsOn}>{date}</time>
			{#if event.recurring}<span> · regelmäßig</span>{/if}
		</p>
	{/if}

	{#if event.description}
		<p
			class="line-clamp-3 {compact
				? 'mb-3 text-sm leading-relaxed text-gray-600'
				: 'mb-2 text-gray-700'}"
		>
			{event.description}
		</p>
	{/if}

	{#if !compact && event.location}
		<p class="mb-2 flex items-center gap-1.5 text-sm text-gray-500">
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

	{#if compact || event.groups.length > 0 || event.tags.length > 0}
		<ul class="mt-auto flex flex-wrap items-center gap-2 pt-1" aria-label="Datum, Gruppen und Tags">
			{#if compact}
				<li>
					<time
						datetime={event.startsOn}
						class="inline-flex items-center rounded-full border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700"
					>
						{date}
					</time>
				</li>
			{/if}
			{#each event.groups as group, i (`g:${event.groupIds[i] ?? group}:${i}`)}
				<li
					class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
					style:background-color={color ?? '#e5e7eb'}
					style:border-color={color ?? '#e5e7eb'}
					style:color={contrastText(color ?? '#e5e7eb')}
				>
					{group}
				</li>
			{/each}
			{#if !compact}
				{#each event.tags as tag (`t:${tag}`)}
					<li
						class="inline-flex items-center rounded-full border border-gray-300 px-2 py-0.5 text-xs font-medium text-gray-600"
					>
						{tag}
					</li>
				{/each}
			{/if}
		</ul>
	{/if}
</a>
