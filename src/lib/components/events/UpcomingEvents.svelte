<script lang="ts">
	/**
	 * Terminvorschau („Nächste Termine“) für andere Seiten (Startseite, Gruppen):
	 * Überschrift mit Link „Alle Termine“ und Karten im Raster.
	 * Ohne eigenen Seitenrand – die einbindende Seite setzt `container-page`/`section-y`.
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
	<header class="mb-6 flex flex-wrap items-end justify-between gap-3">
		<div>
			<p class="eyebrow mb-2">Kalender</p>
			<h2 id={headingId} class="section-title">{title}</h2>
		</div>
		{#if moreHref}
			<a href={moreHref} class="link-more">
				Alle Termine <span aria-hidden="true">→</span>
			</a>
		{/if}
	</header>

	{#if error}
		<Notice title="Termine konnten gerade nicht geladen werden" />
	{:else if events.length === 0}
		<p class="rounded-card border border-dashed border-line bg-white/60 p-5 text-muted">
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
