<script lang="ts">
	import { page } from '$app/state';
	import FilterChip from '$lib/components/gallery/FilterChip.svelte';
	import GalleryCard from '$lib/components/gallery/GalleryCard.svelte';
	import Notice from '$lib/components/Notice.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { buildSearch, galleryYear, parsePage } from '$lib/events';

	const PER_PAGE = 24;

	let { data } = $props();

	const years = $derived(
		[...new Set(data.galleries.map(galleryYear).filter((y): y is number => y !== null))].sort(
			(a, b) => b - a
		)
	);
	const yearParam = $derived(page.url.searchParams.get('jahr'));
	const year = $derived(yearParam && /^\d{4}$/.test(yearParam) ? Number(yearParam) : null);
	const filtered = $derived(
		year === null ? data.galleries : data.galleries.filter((g) => galleryYear(g) === year)
	);
	const pageCount = $derived(Math.max(1, Math.ceil(filtered.length / PER_PAGE)));
	const current = $derived(Math.min(parsePage(page.url.searchParams.get('seite')), pageCount));
	const visible = $derived(filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE));

	function href(params: { jahr?: number | null; seite?: number | null }) {
		const next = { jahr: year, seite: current, ...params };
		return `/galerie${buildSearch({ ...next, seite: next.seite && next.seite > 1 ? next.seite : null })}`;
	}
</script>

<Seo
	title={year ? `Galerie ${year}` : 'Galerie'}
	description="Bilder von Fahrten, Lagern und Aktionen des Stammes Edelweißpiraten."
/>

<PageHeader
	eyebrow="Galerie"
	title="Bildergalerie"
	lead="Einblicke in unsere Fahrten, Lager und Aktionen."
/>

<div class="container-page section-y space-y-8">
	{#if years.length > 1 || year !== null}
		<nav aria-label="Nach Jahr filtern">
			<ul class="flex flex-wrap gap-2">
				<li>
					<FilterChip href={href({ jahr: null, seite: null })} active={year === null}>
						Alle Jahre
					</FilterChip>
				</li>
				{#each years as y (y)}
					<li>
						<FilterChip href={href({ jahr: y, seite: null })} active={year === y}>{y}</FilterChip>
					</li>
				{/each}
			</ul>
		</nav>
	{/if}

	{#if data.galleriesError}
		<Notice title="Galerien konnten gerade nicht geladen werden" />
	{:else if visible.length === 0}
		<Notice tone="info" title="">
			<p>
				{#if year !== null}
					Für {year} gibt es keine Galerien.
					<a href={href({ jahr: null, seite: null })} class="link">Alle Jahre anzeigen</a>
				{:else}
					Noch sind keine Bilder online. Schau bald wieder vorbei!
				{/if}
			</p>
		</Notice>
	{:else}
		<ul class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each visible as gallery (gallery.id)}
				<li><GalleryCard {gallery} /></li>
			{/each}
		</ul>

		{#if pageCount > 1}
			<nav aria-label="Seiten" class="flex flex-wrap items-center justify-center gap-2">
				{#if current > 1}
					<a href={href({ seite: current - 1 })} class="btn btn-secondary" rel="prev">Zurück</a>
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
					<a href={href({ seite: current + 1 })} class="btn btn-secondary" rel="next">Weiter</a>
				{/if}
			</nav>
		{/if}
	{/if}
</div>
