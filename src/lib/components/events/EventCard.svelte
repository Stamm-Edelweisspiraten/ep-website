<script lang="ts">
	/**
	 * Karte eines Termins (Link zur Detailseite): Datumskachel, Titel, Uhrzeit/Zeitraum, Ort,
	 * Farbpunkt, Gruppen und Tags als Chips, Hinweis „Serie“.
	 * `compact` für Listen auf anderen Seiten (Startseite, Gruppen): kleiner, ohne Tags.
	 */
	import type { WebsiteEvent } from '$lib/server/types';
	import { eventHref, eventWhen, isPastEvent } from '$lib/events';
	import { dateParts, formatDateRange, safeColor } from '$lib/format';

	let { event, compact = false }: { event: WebsiteEvent; compact?: boolean } = $props();

	const parts = $derived(dateParts(event.startsOn));
	const color = $derived(safeColor(event.color));
	const when = $derived(eventWhen(event));
	const past = $derived(isPastEvent(event));
	const label = $derived(`${event.title}, ${formatDateRange(event)}`);
</script>

<a
	href={eventHref(event)}
	aria-label={label}
	class="group flex h-full gap-4 rounded-card border border-line bg-surface shadow-card transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0 {compact
		? 'p-4'
		: 'p-5'}"
>
	{#if parts}
		<div
			class="flex shrink-0 flex-col items-center justify-center rounded-xl text-center {past
				? 'bg-canvas text-muted'
				: 'bg-brand-50 text-brand-900'} {compact ? 'w-14 py-2' : 'w-16 py-2.5'}"
			aria-hidden="true"
		>
			<span class="text-[0.7rem] font-semibold tracking-wide uppercase">{parts.month}</span>
			<span class="leading-none font-bold {compact ? 'text-2xl' : 'text-3xl'}">{parts.day}</span>
			<span class="mt-0.5 text-xs">{parts.weekday}</span>
		</div>
	{/if}

	<div class="min-w-0 flex-1">
		<p class="flex items-start gap-2">
			{#if color}
				<span
					class="mt-1.5 size-2.5 shrink-0 rounded-full ring-2 ring-white"
					style:background-color={color}
					aria-hidden="true"
				></span>
			{/if}
			<span
				class="font-semibold text-ink group-hover:text-brand-800 {compact
					? 'line-clamp-2 text-base'
					: 'text-lg leading-snug'}"
			>
				{event.title}
			</span>
		</p>

		<ul class="mt-1.5 space-y-1 text-sm text-muted">
			<li class="flex items-center gap-1.5">
				<svg
					class="size-4 shrink-0"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					aria-hidden="true"
				>
					<circle cx="12" cy="12" r="9" />
					<path stroke-linecap="round" d="M12 7v5l3 2" />
				</svg>
				<span>{when}</span>
				{#if event.recurring}
					<span
						class="ml-1 rounded-full border border-brand-200 px-2 py-px text-xs font-medium text-brand-800"
					>
						Serie
					</span>
				{/if}
			</li>
			{#if event.location}
				<li class="flex items-center gap-1.5">
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
				</li>
			{/if}
		</ul>

		{#if event.groups.length > 0 || (!compact && event.tags.length > 0)}
			<ul class="mt-3 flex flex-wrap gap-1.5" aria-label="Gruppen und Tags">
				{#each event.groups as group, i (`g:${event.groupIds[i] ?? group}:${i}`)}
					<li class="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-900">
						{group}
					</li>
				{/each}
				{#if !compact}
					{#each event.tags as tag (`t:${tag}`)}
						<li
							class="rounded-full border border-line bg-canvas px-2.5 py-0.5 text-xs font-medium text-muted"
						>
							#{tag}
						</li>
					{/each}
				{/if}
			</ul>
		{/if}
	</div>
</a>
