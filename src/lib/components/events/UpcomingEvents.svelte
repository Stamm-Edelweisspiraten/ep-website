<script lang="ts">
	/**
	 * Abschnitt „Nächste Termine“ für andere Seiten (Startseite, Gruppen). Ohne eigenen
	 * Seitenrand – die einbindende Seite setzt `container-page`/`section-y`.
	 */
	import type { WebsiteEvent } from '$lib/server/types';
	import { eventKey } from '$lib/events';
	import EventCard from './EventCard.svelte';
	import Notice from '$lib/components/Notice.svelte';

	let {
		events,
		error = false,
		title = 'Nächste Termine',
		moreHref = '/termine',
		emptyText = 'Gerade stehen keine Termine an.',
		class: className = ''
	}: {
		events: WebsiteEvent[];
		error?: boolean;
		title?: string;
		moreHref?: string | null;
		emptyText?: string;
		/** Zusätzliche Klassen für den Abschnitt */
		class?: string;
	} = $props();

	const headingId = $props.id();
</script>

<section aria-labelledby={headingId} class={className}>
	<div class="mb-5 flex flex-wrap items-end justify-between gap-3">
		<h2 id={headingId} class="text-2xl sm:text-3xl">{title}</h2>
		{#if moreHref}
			<a href={moreHref} class="link inline-flex items-center gap-1 text-sm">
				Alle Termine
				<svg
					class="size-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					aria-hidden="true"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
				</svg>
			</a>
		{/if}
	</div>

	{#if error}
		<Notice title="Termine konnten gerade nicht geladen werden" />
	{:else if events.length === 0}
		<p class="rounded-card border border-dashed border-line bg-surface p-6 text-center text-muted">
			{emptyText}
		</p>
	{:else}
		<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each events as event (eventKey(event))}
				<li><EventCard {event} compact /></li>
			{/each}
		</ul>
	{/if}
</section>
