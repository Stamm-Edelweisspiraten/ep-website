<script lang="ts">
	/**
	 * Terminvorschau („Nächste Termine“) für andere Seiten (Startseite, Gruppen) – aufgebaut wie
	 * die Terminvorschau der alten Website: umrahmter Kasten, Karten im Raster, „Alle Termine“.
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

<section aria-labelledby={headingId} class="w-full border border-gray-200 bg-white p-5 {className}">
	<header class="mb-4 flex items-center justify-between gap-3">
		<h2 id={headingId} class="flex items-center gap-2 text-xl font-semibold tracking-tight">
			<svg
				class="size-5 shrink-0 text-blue-700"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				aria-hidden="true"
			>
				<rect x="3" y="5" width="18" height="16" rx="2" />
				<path stroke-linecap="round" d="M3 10h18M8 3v4m8-4v4" />
			</svg>
			{title}
		</h2>
		{#if moreHref}
			<a
				href={moreHref}
				class="hidden items-center gap-2 rounded border border-blue-600 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 active:bg-blue-100 sm:inline-flex"
			>
				Alle Termine
				<svg
					class="size-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="m13.5 4.5 7.5 7.5-7.5 7.5m-9-15L12 12l-7.5 7.5"
					/>
				</svg>
			</a>
		{/if}
	</header>

	{#if error}
		<Notice title="Termine konnten gerade nicht geladen werden" />
	{:else if events.length === 0}
		<p class="border border-dashed border-gray-300 bg-gray-50 p-4 text-gray-600">
			{emptyText}
		</p>
	{:else}
		<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each events as event (eventKey(event))}
				<li><EventCard {event} compact /></li>
			{/each}
		</ul>
	{/if}

	{#if moreHref}
		<div class="mt-4 sm:hidden">
			<a
				href={moreHref}
				class="inline-flex w-full items-center justify-center gap-2 rounded bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 active:bg-blue-800"
			>
				Alle Termine
			</a>
		</div>
	{/if}
</section>
