<script lang="ts">
	import ShareButton from '$lib/components/events/ShareButton.svelte';
	import GalleryCard from '$lib/components/gallery/GalleryCard.svelte';
	import Notice from '$lib/components/Notice.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import {
		contrastText,
		eventGroupLinks,
		formatEventDate,
		isPastEvent,
		osmSearchUrl
	} from '$lib/events';
	import { formatDateRange, safeColor } from '$lib/format';
	import { galleryImageUrl } from '$lib/images';

	let { data } = $props();

	const event = $derived(data.event);
	const color = $derived(safeColor(event.color));
	const chipColor = $derived(color ?? '#e5e7eb');
	const date = $derived(formatEventDate(event));
	const past = $derived(isPastEvent(event));
	const groupLinks = $derived(eventGroupLinks(event, data.groups));

	const description = $derived(
		event.description
			? event.description.replace(/\s+/g, ' ').trim().slice(0, 200)
			: `${formatDateRange(event)}${event.location ? ` · ${event.location}` : ''}`
	);
	const coverGallery = $derived(data.galleries.find((g) => g.cover) ?? null);
</script>

<Seo
	title={event.title}
	{description}
	image={coverGallery?.cover
		? galleryImageUrl(coverGallery.id, coverGallery.cover.imageId, 'web')
		: undefined}
/>

<section class="mx-auto max-w-5xl space-y-4 px-4 py-8 sm:px-6">
	<div class="flex items-center justify-between gap-3">
		<a
			href="/termine"
			class="inline-flex min-h-9 items-center gap-1 text-sm text-blue-700 hover:underline"
		>
			<span aria-hidden="true">←</span> Zurück zu den Terminen
		</a>
		<ShareButton title={event.title} text={`${event.title} – ${date}`} />
	</div>

	<article class="w-full border border-gray-200 bg-white p-6">
		{#if past || event.recurring}
			<p class="mb-1 text-xs font-semibold tracking-wide text-gray-400 uppercase">
				{[past ? 'Vergangener Termin' : '', event.recurring ? 'Regelmäßiger Termin' : '']
					.filter(Boolean)
					.join(' · ')}
			</p>
		{/if}
		<h1 class="mb-1 text-2xl font-bold sm:text-3xl">{event.title}</h1>
		<p class="mb-3 text-sm text-gray-600">
			<time datetime={event.startsOn}>{date}</time>
		</p>

		{#if groupLinks.length > 0 || event.tags.length > 0}
			<ul class="mb-4 flex flex-wrap gap-2" aria-label="Gruppen und Themen">
				{#each groupLinks as group (group.id)}
					<li>
						{#if group.href}
							<a
								href={group.href}
								class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium hover:underline"
								style:background-color={chipColor}
								style:border-color={chipColor}
								style:color={contrastText(chipColor)}
							>
								{group.name}
							</a>
						{:else}
							<span
								class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
								style:background-color={chipColor}
								style:border-color={chipColor}
								style:color={contrastText(chipColor)}
							>
								{group.name}
							</span>
						{/if}
					</li>
				{/each}
				{#each event.tags as tag (tag)}
					<li>
						<a
							href="/termine?tag={encodeURIComponent(tag)}"
							class="inline-flex items-center rounded-full border border-gray-300 px-2 py-0.5 text-xs font-medium text-gray-600 hover:border-gray-400 hover:text-blue-700"
						>
							{tag}
						</a>
					</li>
				{/each}
			</ul>
		{/if}

		{#if event.description}
			<p class="leading-relaxed whitespace-pre-line text-gray-800">{event.description}</p>
		{/if}

		{#if event.location}
			<div class="mt-6 border-t border-gray-200 pt-4">
				<h2 class="text-sm font-semibold text-gray-500">Ort</h2>
				<p class="mt-1 whitespace-pre-line text-gray-800">{event.location}</p>
				<a
					href={osmSearchUrl(event.location)}
					class="mt-1 inline-block text-sm text-blue-600 hover:underline"
					target="_blank"
					rel="noopener noreferrer"
				>
					Auf der Karte ansehen<span class="sr-only"> (OpenStreetMap, neues Fenster)</span>
				</a>
			</div>
		{/if}

		{#if data.galleriesError}
			<Notice class="mt-6" title="Bilder zu diesem Termin konnten gerade nicht geladen werden" />
		{:else if data.galleries.length > 0}
			<div class="mt-6 border-t border-gray-200 pt-4">
				<h2 class="mb-3 text-lg font-semibold">Bilder</h2>
				<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
					{#each data.galleries as gallery (gallery.id)}
						<li><GalleryCard {gallery} headingLevel="h3" /></li>
					{/each}
				</ul>
			</div>
		{/if}
	</article>
</section>
