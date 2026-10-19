<script lang="ts">
	import ShareButton from '$lib/components/events/ShareButton.svelte';
	import GalleryCard from '$lib/components/gallery/GalleryCard.svelte';
	import Notice from '$lib/components/Notice.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { eventGroupLinks, eventWhen, isPastEvent, osmSearchUrl } from '$lib/events';
	import { dateParts, formatDateLong, formatDateRange, safeColor } from '$lib/format';
	import { galleryImageUrl } from '$lib/images';

	let { data } = $props();

	const event = $derived(data.event);
	const parts = $derived(dateParts(event.startsOn));
	const color = $derived(safeColor(event.color));
	const range = $derived(formatDateRange(event));
	const past = $derived(isPastEvent(event));
	const groupLinks = $derived(eventGroupLinks(event, data.groups));
	const subtitle = $derived.by(() => {
		const multiDay = Boolean(event.endsOn && event.endsOn !== event.startsOn);
		if (multiDay) return range;
		const when = eventWhen(event);
		const day = formatDateLong(event.startsOn);
		return when === 'Ganztägig' ? day : `${day}, ${when}`;
	});

	const description = $derived(
		event.description
			? event.description.replace(/\s+/g, ' ').trim().slice(0, 200)
			: `${range}${event.location ? ` · ${event.location}` : ''}`
	);
	const cover = $derived(data.galleries.find((g) => g.cover)?.cover ?? null);
	const coverGallery = $derived(data.galleries.find((g) => g.cover) ?? null);
</script>

<Seo
	title={event.title}
	{description}
	image={coverGallery && cover ? galleryImageUrl(coverGallery.id, cover.imageId, 'web') : undefined}
/>

<header class="border-b border-line bg-surface">
	<div class="container-page py-8 sm:py-12">
		<a href="/termine" class="link inline-flex items-center gap-1 text-sm">
			<svg
				class="size-4"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				aria-hidden="true"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M19 12H5m6 6-6-6 6-6" />
			</svg>
			Zurück zu allen Terminen
		</a>

		<div class="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
			{#if parts}
				<div
					class="flex w-20 shrink-0 flex-col items-center rounded-2xl py-3 text-center {past
						? 'bg-canvas text-muted'
						: 'bg-brand-50 text-brand-900'}"
					aria-hidden="true"
				>
					<span class="text-xs font-semibold tracking-wide uppercase">{parts.month}</span>
					<span class="text-4xl leading-none font-bold">{parts.day}</span>
					<span class="mt-1 text-xs">{parts.weekday} {parts.year}</span>
				</div>
			{/if}
			<div class="min-w-0 flex-1">
				<p class="eyebrow mb-2 flex items-center gap-2">
					{#if color}
						<span class="size-2.5 rounded-full" style:background-color={color} aria-hidden="true"
						></span>
					{/if}
					{past ? 'Vergangener Termin' : 'Termin'}{event.recurring ? ' · Serie' : ''}
				</p>
				<h1 class="text-3xl sm:text-4xl">{event.title}</h1>
				<p class="mt-3 text-lg text-muted">{subtitle}</p>
			</div>
			<ShareButton title={event.title} text={`${event.title} – ${range}`} class="shrink-0" />
		</div>
	</div>
</header>

<div class="container-page section-y grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
	<div class="min-w-0 space-y-10">
		<section aria-labelledby="beschreibung">
			<h2 id="beschreibung" class="sr-only">Beschreibung</h2>
			{#if event.description}
				<p class="prose-site text-lg whitespace-pre-line">{event.description}</p>
			{:else}
				<p class="text-muted">Zu diesem Termin gibt es noch keine Beschreibung.</p>
			{/if}
		</section>

		{#if data.galleriesError}
			<Notice title="Bilder zu diesem Termin konnten gerade nicht geladen werden" />
		{:else if data.galleries.length > 0}
			<section aria-labelledby="galerien" class="space-y-4">
				<h2 id="galerien" class="text-2xl">Bilder</h2>
				<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{#each data.galleries as gallery (gallery.id)}
						<li><GalleryCard {gallery} headingLevel="h3" /></li>
					{/each}
				</ul>
			</section>
		{/if}
	</div>

	<aside aria-label="Details" class="lg:sticky lg:top-24 lg:self-start">
		<dl class="space-y-5 rounded-card border border-line bg-surface p-6 shadow-card">
			<div>
				<dt class="eyebrow">Wann</dt>
				<dd class="mt-1">
					{range}
					{#if event.recurring}
						<span class="mt-1 block text-sm text-muted">Teil einer Terminserie</span>
					{/if}
				</dd>
			</div>
			{#if event.location}
				<div>
					<dt class="eyebrow">Wo</dt>
					<dd class="mt-1">
						<span class="block whitespace-pre-line">{event.location}</span>
						<a
							href={osmSearchUrl(event.location)}
							class="link mt-1 inline-block text-sm"
							target="_blank"
							rel="noopener noreferrer"
						>
							Auf der Karte ansehen<span class="sr-only"> (OpenStreetMap, neues Fenster)</span>
						</a>
					</dd>
				</div>
			{/if}
			{#if groupLinks.length > 0}
				<div>
					<dt class="eyebrow">Für</dt>
					<dd class="mt-2">
						<ul class="flex flex-wrap gap-1.5">
							{#each groupLinks as group (group.id)}
								<li>
									{#if group.href}
										<a
											href={group.href}
											class="inline-block rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-900 hover:bg-brand-200"
										>
											{group.name}
										</a>
									{:else}
										<span
											class="inline-block rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-900"
										>
											{group.name}
										</span>
									{/if}
								</li>
							{/each}
						</ul>
					</dd>
				</div>
			{/if}
			{#if event.tags.length > 0}
				<div>
					<dt class="eyebrow">Themen</dt>
					<dd class="mt-2">
						<ul class="flex flex-wrap gap-1.5">
							{#each event.tags as tag (tag)}
								<li>
									<a
										href="/termine?tag={encodeURIComponent(tag)}"
										class="inline-block rounded-full border border-line bg-canvas px-3 py-1 text-sm text-muted hover:border-brand-300 hover:text-brand-800"
									>
										#{tag}
									</a>
								</li>
							{/each}
						</ul>
					</dd>
				</div>
			{/if}
		</dl>
	</aside>
</div>
