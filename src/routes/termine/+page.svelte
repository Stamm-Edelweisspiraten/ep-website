<script lang="ts">
	import { page } from '$app/state';
	import EventCard from '$lib/components/events/EventCard.svelte';
	import SeriesCard from '$lib/components/events/SeriesCard.svelte';
	import FilterChip from '$lib/components/gallery/FilterChip.svelte';
	import Notice from '$lib/components/Notice.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import {
		buildSearch,
		collapseSeries,
		collectGroups,
		collectTags,
		eventKey,
		filterEvents,
		groupByMonth,
		groupParamValue,
		resolveGroupParam,
		type FilterOption
	} from '$lib/events';

	let { data } = $props();

	const tag = $derived(page.url.searchParams.get('tag') || null);
	const groupParam = $derived(page.url.searchParams.get('gruppe') || null);
	const group = $derived(resolveGroupParam(groupParam, data.groups));
	/** `?serien=alle`: jedes Vorkommen einzeln statt „Regelmäßige Termine“ */
	const allOccurrences = $derived(page.url.searchParams.get('serien') === 'alle');

	// Ohne `?serien=alle` zählt jede Serie in den Filter-Chips nur einmal.
	const collapsedAll = $derived(collapseSeries(data.events));
	const units = $derived(
		allOccurrences
			? data.events
			: [...collapsedAll.singles, ...collapsedAll.series.map((s) => s.event)]
	);
	const tagOptions = $derived(withActive(collectTags(units), tag));
	const groupOptions = $derived(withActive(collectGroups(units), group, groupParam));

	const filtered = $derived(filterEvents(data.events, { tag, group }));
	const collapsed = $derived(collapseSeries(filtered));
	const series = $derived(allOccurrences ? [] : collapsed.series);
	const listed = $derived(allOccurrences ? filtered : collapsed.singles);
	const months = $derived(groupByMonth(listed));
	const hasFilter = $derived(Boolean(tag || group));
	const hasSeries = $derived(collapsedAll.series.length > 0);
	const resultCount = $derived(series.length + listed.length);

	/** Aktiver Filter, der im Zeitraum nicht vorkommt, bleibt als Chip sichtbar (zum Abwählen). */
	function withActive(options: FilterOption[], active: string | null, label?: string | null) {
		if (!active || options.some((o) => o.value === active)) return options;
		return [...options, { value: active, label: label ?? active, count: 0 }];
	}

	function href(params: {
		rueckblick?: number | null;
		tag?: string | null;
		gruppe?: string | null;
		serien?: string | null;
	}) {
		const next = {
			rueckblick: data.review,
			tag,
			gruppe: group ? groupParamValue(group, data.groups) : null,
			serien: allOccurrences ? 'alle' : null,
			...params
		};
		return `/termine${buildSearch(next)}`;
	}

	const lead = $derived(
		data.review
			? `Rückblick auf ${data.review}: Was wir unternommen haben.`
			: 'Gruppenstunden, Fahrten, Lager und alles, was im Stamm ansteht.'
	);
</script>

<Seo
	title={data.review ? `Termine ${data.review}` : 'Termine'}
	description="Kommende Termine des Stammes Edelweißpiraten: Gruppenstunden, Fahrten, Lager und Aktionen."
/>

<PageHeader eyebrow={data.review ? 'Rückblick' : 'Termine'} title="Termine" {lead} />

<div class="container-page section-y space-y-8">
	<nav aria-label="Zeitraum" class="flex flex-wrap items-center gap-2">
		<FilterChip
			href={href({ rueckblick: null })}
			active={data.review === null}
			replaceState={false}
		>
			Kommende
		</FilterChip>
		<span class="mx-1 text-sm text-muted">Rückblick:</span>
		{#each data.years as year (year)}
			<FilterChip
				href={href({ rueckblick: year })}
				active={data.review === year}
				replaceState={false}
			>
				{year}
			</FilterChip>
		{/each}
	</nav>

	{#if groupOptions.length > 0 || tagOptions.length > 0 || hasSeries}
		<div class="space-y-4 rounded-card border border-line bg-surface p-4 sm:p-5">
			{#if groupOptions.length > 0}
				{@render chipRow('Gruppe', groupOptions, group, (value) => ({
					gruppe: value === group ? null : groupParamValue(value, data.groups)
				}))}
			{/if}
			{#if tagOptions.length > 0}
				{@render chipRow('Thema', tagOptions, tag, (value) => ({
					tag: value === tag ? null : value
				}))}
			{/if}
			{#if hasSeries}
				<div class="flex flex-col gap-2 sm:flex-row sm:items-baseline">
					<span class="w-20 shrink-0 text-sm font-semibold text-muted">Serien</span>
					<ul class="flex flex-wrap gap-2" aria-label="Darstellung der Serien">
						<li>
							<FilterChip href={href({ serien: null })} active={!allOccurrences}>
								Zusammengefasst
							</FilterChip>
						</li>
						<li>
							<FilterChip href={href({ serien: 'alle' })} active={allOccurrences}>
								Alle Vorkommen anzeigen
							</FilterChip>
						</li>
					</ul>
				</div>
			{/if}
			{#if hasFilter}
				<a
					href={href({ tag: null, gruppe: null })}
					class="link text-sm"
					data-sveltekit-noscroll
					data-sveltekit-keepfocus
					data-sveltekit-replacestate
				>
					Filter zurücksetzen
				</a>
			{/if}
		</div>
	{/if}

	<div aria-live="polite" class="sr-only">
		{resultCount === 1 ? '1 Eintrag' : `${resultCount} Einträge`}
	</div>

	{#if data.eventsError}
		<Notice title="Termine konnten gerade nicht geladen werden" />
	{:else if resultCount === 0}
		<Notice tone="info" title={hasFilter ? 'Keine passenden Termine' : ''}>
			<p>
				{#if hasFilter}
					Für diese Auswahl gibt es {data.review ? `${data.review} keine` : 'gerade keine'} Termine.
					<a href={href({ tag: null, gruppe: null })} class="link">Filter zurücksetzen</a>
				{:else if data.review}
					Für {data.review} sind keine Termine eingetragen.
				{:else}
					Gerade stehen keine Termine an. Schau bald wieder vorbei!
				{/if}
			</p>
		</Notice>
	{:else}
		{#if data.partialError}
			<Notice
				title="Nicht alle Termine konnten geladen werden"
				message="Ein Teil der Termine fehlt gerade. Bitte versuche es in ein paar Minuten noch einmal."
			/>
		{/if}

		{#if series.length > 0}
			<section aria-labelledby="regelmaessig" class="space-y-4">
				<div class="flex flex-wrap items-baseline justify-between gap-3">
					<h2 id="regelmaessig" class="text-xl sm:text-2xl">Regelmäßige Termine</h2>
					<a
						href={href({ serien: 'alle' })}
						class="link text-sm"
						data-sveltekit-noscroll
						data-sveltekit-keepfocus
						data-sveltekit-replacestate
					>
						Alle Vorkommen anzeigen
					</a>
				</div>
				<ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{#each series as item (item.id)}
						<li><SeriesCard series={item} review={data.review !== null} /></li>
					{/each}
				</ul>
			</section>
		{/if}

		{#if months.length > 0}
			{#each months as month (month.key)}
				<section aria-labelledby="monat-{month.key}" class="space-y-4">
					<h2
						id="monat-{month.key}"
						class="sticky top-16 z-10 -mx-1 bg-canvas/95 px-1 py-2 text-xl backdrop-blur sm:text-2xl"
					>
						{month.label}
					</h2>
					<ul class="grid grid-cols-1 gap-4 md:grid-cols-2">
						{#each month.events as event (eventKey(event))}
							<li><EventCard {event} /></li>
						{/each}
					</ul>
				</section>
			{/each}
		{:else if series.length > 0}
			<p class="text-muted">
				{data.review
					? `Außer den regelmäßigen Terminen gab es ${data.review} keine weiteren.`
					: 'Außer den regelmäßigen Terminen steht gerade nichts an.'}
			</p>
		{/if}

		{#if data.truncated}
			<p class="text-sm text-muted">
				Es werden möglicherweise nicht alle Termine angezeigt. Mit den Filtern findest du gezielt
				weitere.
			</p>
		{/if}
	{/if}
</div>

{#snippet chipRow(
	label: string,
	options: FilterOption[],
	active: string | null,
	params: (value: string) => { tag?: string | null; gruppe?: string | null }
)}
	<div class="flex flex-col gap-2 sm:flex-row sm:items-baseline">
		<span class="w-20 shrink-0 text-sm font-semibold text-muted">{label}</span>
		<ul class="flex flex-wrap gap-2" aria-label="Nach {label} filtern">
			{#each options as option (option.value)}
				<li>
					<FilterChip
						href={href(params(option.value))}
						active={option.value === active}
						count={option.count}
					>
						{option.label}
					</FilterChip>
				</li>
			{/each}
		</ul>
	</div>
{/snippet}
