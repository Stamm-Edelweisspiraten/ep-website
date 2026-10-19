<script lang="ts">
	import DateBadge from '$lib/components/events/DateBadge.svelte';
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

<section class="mx-auto w-full max-w-4xl space-y-5 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
	<div class="flex items-center justify-between gap-3">
		<a href="/termine" class="link-more text-sm">
			<span aria-hidden="true">←</span> Zurück zu den Terminen
		</a>
		<ShareButton title={event.title} text={`${event.title} – ${date}`} />
	</div>

	<article class="card relative w-full overflow-hidden p-6 sm:p-10">
		<span
			class="absolute inset-x-0 top-0 h-1.5"
			style:background-color={color ?? 'var(--color-brand-600)'}
			aria-hidden="true"
		></span>
		<div class="flex items-start gap-5">
			<DateBadge date={event.startsOn} class="hidden sm:flex" />
			<div class="min-w-0">
				{#if past || event.recurring}
					<p class="eyebrow mb-2">
						{[past ? 'Vergangener Termin' : '', event.recurring ? 'Regelmäßiger Termin' : '']
							.filter(Boolean)
							.join(' · ')}
					</p>
				{/if}
				<h1 class="text-2xl font-extrabold sm:text-4xl">{event.title}</h1>
				<p class="mt-2 mb-4 font-medium text-muted">
					<time datetime={event.startsOn}>{date}</time>
				</p>
			</div>
		</div>

		{#if groupLinks.length > 0 || event.tags.length > 0}
			<ul class="mb-4 flex flex-wrap gap-2" aria-label="Gruppen und Themen">
				{#each groupLinks as group (group.id)}
					<li>
						{#if group.href}
							<a
								href={group.href}
								class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold hover:underline"
								style:background-color={chipColor}
								style:color={contrastText(chipColor)}
							>
								{group.name}
							</a>
						{:else}
							<span
								class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
								style:background-color={chipColor}
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
							class="chip hover:border-brand-200 hover:text-brand-700"
						>
							{tag}
						</a>
					</li>
				{/each}
			</ul>
		{/if}

		{#if event.description}
			<p class="text-lg leading-relaxed whitespace-pre-line text-gray-700">{event.description}</p>
		{/if}

		{#if event.location}
			<div class="mt-8 rounded-xl bg-soft p-4 sm:p-5">
				<h2 class="text-xs font-semibold tracking-wide text-muted uppercase">Ort</h2>
				<p class="mt-1 font-semibold whitespace-pre-line text-ink">{event.location}</p>
				<a
					href={osmSearchUrl(event.location)}
					class="link mt-2 inline-block text-sm"
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
			<div class="mt-8 border-t border-line pt-6">
				<h2 class="mb-4 text-xl font-bold">Bilder</h2>
				<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
					{#each data.galleries as gallery (gallery.id)}
						<li><GalleryCard {gallery} headingLevel="h3" /></li>
					{/each}
				</ul>
			</div>
		{/if}
	</article>
</section>
