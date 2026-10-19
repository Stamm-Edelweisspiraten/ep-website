<script lang="ts">
	import { page } from '$app/state';
	import FilterChip from '$lib/components/gallery/FilterChip.svelte';
	import GalleryCard from '$lib/components/gallery/GalleryCard.svelte';
	import Notice from '$lib/components/Notice.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import {
		buildSearch,
		galleryYear,
		groupParamValue,
		parsePage,
		resolveGroupParam,
		type FilterOption
	} from '$lib/events';

	const PER_PAGE = 24;

	let { data } = $props();

	const years = $derived(
		[...new Set(data.galleries.map(galleryYear).filter((y): y is number => y !== null))].sort(
			(a, b) => b - a
		)
	);
	const yearParam = $derived(page.url.searchParams.get('jahr'));
	const year = $derived(yearParam && /^\d{4}$/.test(yearParam) ? Number(yearParam) : null);
	const groupParam = $derived(page.url.searchParams.get('gruppe') || null);
	const group = $derived(resolveGroupParam(groupParam, data.groups));

	const groupsOf = (id: string): string[] => data.galleryGroups[id] ?? [];

	/** Gruppen aller Galerien (über die verknüpften Termine), „ganzer Stamm“ zuerst */
	const groupOptions = $derived.by((): FilterOption[] => {
		const counts = new Map<string, number>();
		for (const gallery of data.galleries) {
			for (const id of groupsOf(gallery.id)) counts.set(id, (counts.get(id) ?? 0) + 1);
		}
		const options = [...counts.entries()].map(([value, count]) => ({
			value,
			label: data.groupNames[value] ?? value,
			count
		}));
		options.sort((a, b) => {
			if (a.value === 'stamm' || b.value === 'stamm') return a.value === 'stamm' ? -1 : 1;
			return a.label.localeCompare(b.label, 'de');
		});
		if (group && !counts.has(group)) {
			options.push({ value: group, label: groupParam ?? group, count: 0 });
		}
		return options;
	});

	const filtered = $derived(
		data.galleries.filter(
			(g) =>
				(year === null || galleryYear(g) === year) &&
				(group === null || groupsOf(g.id).includes(group))
		)
	);
	const pageCount = $derived(Math.max(1, Math.ceil(filtered.length / PER_PAGE)));
	const current = $derived(Math.min(parsePage(page.url.searchParams.get('seite')), pageCount));
	const visible = $derived(filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE));
	const hasFilter = $derived(year !== null || group !== null);

	function href(params: { jahr?: number | null; gruppe?: string | null; seite?: number | null }) {
		const next = {
			jahr: year,
			gruppe: group ? groupParamValue(group, data.groups) : null,
			seite: current,
			...params
		};
		return `/galerie${buildSearch({ ...next, seite: next.seite && next.seite > 1 ? next.seite : null })}`;
	}
</script>

<Seo
	title={year ? `Galerie ${year}` : 'Galerie'}
	description="Bilder von Fahrten, Lagern und Aktionen des Stammes Edelweißpiraten."
/>

<section class="mx-auto max-w-6xl space-y-8 px-4 py-12 sm:px-6">
	<header class="space-y-2 text-center">
		<h1 class="text-3xl font-bold tracking-tight">Bildergalerie</h1>
		<p class="text-sm text-gray-600">Einblicke in unsere Aktionen und Termine</p>
	</header>

	{#if years.length > 1 || year !== null || groupOptions.length > 0}
		<div class="space-y-3">
			{#if years.length > 1 || year !== null}
				<ul class="flex flex-wrap justify-center gap-2" aria-label="Nach Jahr filtern">
					<li>
						<FilterChip href={href({ jahr: null, seite: null })} active={year === null}>
							Alle Jahre
						</FilterChip>
					</li>
					{#each years as y (y)}
						<li>
							<FilterChip href={href({ jahr: y, seite: null })} active={year === y}>
								{y}
							</FilterChip>
						</li>
					{/each}
				</ul>
			{/if}
			{#if groupOptions.length > 0}
				<ul class="flex flex-wrap justify-center gap-2" aria-label="Nach Gruppe filtern">
					<li>
						<FilterChip href={href({ gruppe: null, seite: null })} active={group === null}>
							Alle Gruppen
						</FilterChip>
					</li>
					{#each groupOptions as option (option.value)}
						<li>
							<FilterChip
								href={href({ gruppe: groupParamValue(option.value, data.groups), seite: null })}
								active={group === option.value}
							>
								{option.label}
							</FilterChip>
						</li>
					{/each}
				</ul>
			{/if}
			{#if hasFilter}
				<p class="text-center">
					<a
						href={href({ jahr: null, gruppe: null, seite: null })}
						class="text-sm text-gray-600 underline hover:text-blue-700"
						data-sveltekit-noscroll
						data-sveltekit-keepfocus
						data-sveltekit-replacestate
					>
						Filter zurücksetzen
					</a>
				</p>
			{/if}
		</div>
	{/if}

	<div aria-live="polite" class="sr-only">
		{filtered.length === 1 ? '1 Galerie' : `${filtered.length} Galerien`}
	</div>

	{#if data.galleriesError}
		<Notice title="Galerien konnten gerade nicht geladen werden" />
	{:else if visible.length === 0}
		<p class="text-center text-gray-500">
			{#if hasFilter}
				Keine Einträge gefunden.
				<a
					href={href({ jahr: null, gruppe: null, seite: null })}
					class="text-blue-600 hover:underline"
				>
					Filter zurücksetzen
				</a>
			{:else}
				Noch sind keine Bilder online. Schau bald wieder vorbei!
			{/if}
		</p>
	{:else}
		<ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each visible as gallery (gallery.id)}
				<li><GalleryCard {gallery} /></li>
			{/each}
		</ul>

		{#if pageCount > 1}
			<nav aria-label="Seiten" class="flex flex-wrap items-center justify-center gap-2">
				{#if current > 1}
					<a
						href={href({ seite: current - 1 })}
						class="inline-flex min-h-9 items-center border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50"
						rel="prev"
					>
						<span aria-hidden="true">◀</span><span class="sr-only">Vorherige Seite</span>
					</a>
				{/if}
				<ul class="flex flex-wrap gap-1">
					{#each Array.from({ length: pageCount }, (_, i) => i + 1) as n (n)}
						<li>
							<FilterChip
								href={href({ seite: n })}
								active={n === current}
								current="page"
								replaceState={false}
								keepPosition={false}
								label="Seite {n}"
								class="min-w-9"
							>
								{n}
							</FilterChip>
						</li>
					{/each}
				</ul>
				{#if current < pageCount}
					<a
						href={href({ seite: current + 1 })}
						class="inline-flex min-h-9 items-center border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50"
						rel="next"
					>
						<span aria-hidden="true">▶</span><span class="sr-only">Nächste Seite</span>
					</a>
				{/if}
			</nav>
		{/if}
	{/if}
</section>
