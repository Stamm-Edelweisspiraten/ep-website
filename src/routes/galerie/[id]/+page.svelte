<script lang="ts">
	import { afterNavigate, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import ShareButton from '$lib/components/events/ShareButton.svelte';
	import Lightbox, { type LightboxImage } from '$lib/components/Lightbox.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { buildSearch, galleryDateLabel, imageCountLabel } from '$lib/events';
	import { formatDateRange } from '$lib/format';
	import { galleryImageUrl } from '$lib/images';

	let { data } = $props();

	const gallery = $derived(data.gallery);
	const dateLabel = $derived(galleryDateLabel(gallery));

	const images: LightboxImage[] = $derived(
		gallery.images.map((image, i) => ({
			id: image.id,
			src: galleryImageUrl(gallery.id, image.id, 'web'),
			alt: image.description?.trim() || `Bild ${i + 1} aus ${gallery.title}`,
			description: image.description?.trim() || null,
			width: image.width,
			height: image.height
		}))
	);

	function indexFromUrl(url: URL): number | null {
		const id = url.searchParams.get('bild');
		if (!id) return null;
		const i = gallery.images.findIndex((image) => image.id === id);
		return i >= 0 ? i : null;
	}

	// Offenes Bild: `?bild=<imageId>` (Deep-Link); beim Blättern wird die URL ersetzt.
	let openIndex: number | null = $state(indexFromUrl(page.url));
	afterNavigate(({ to }) => {
		if (to?.url) openIndex = indexFromUrl(to.url);
	});

	function urlFor(index: number | null): string {
		const url = new URL(page.url);
		const id = index === null ? null : gallery.images[index]?.id;
		const params = Object.fromEntries(url.searchParams);
		delete params.bild;
		return `${url.pathname}${buildSearch({ ...params, bild: id ?? null })}`;
	}

	/** Nur aus Nutzeraktionen aufrufen (Router muss bereit sein). */
	function setOpen(index: number | null) {
		openIndex = index;
		replaceState(urlFor(index), {});
	}

	function open(index: number, event: MouseEvent) {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
		event.preventDefault();
		setOpen(index);
	}

	const cover = $derived(gallery.cover);
</script>

<Seo
	title={gallery.title}
	description={gallery.description?.replace(/\s+/g, ' ').trim().slice(0, 200) ||
		`${imageCountLabel(gallery.imageCount)} aus der Galerie „${gallery.title}“.`}
	image={cover ? galleryImageUrl(gallery.id, cover.imageId, 'web') : undefined}
/>

<section class="mx-auto max-w-5xl space-y-6 px-4 py-12 sm:px-6">
	<div class="flex items-center justify-between gap-3">
		<a
			href="/galerie"
			class="inline-flex min-h-9 items-center gap-1 text-sm text-blue-600 hover:underline"
		>
			<svg class="size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
				<path
					fill-rule="evenodd"
					d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
				/>
			</svg>
			Zurück zur Galerie
		</a>
		<ShareButton title={`Bilder von ${gallery.title}`} />
	</div>

	<div>
		<h1 class="mb-2 text-2xl font-bold sm:text-3xl">{gallery.title}</h1>
		<p class="text-gray-500">
			{[dateLabel, imageCountLabel(gallery.imageCount)].filter(Boolean).join(' · ')}
		</p>
		{#if gallery.description}
			<p class="mt-4 leading-relaxed whitespace-pre-line text-gray-800">{gallery.description}</p>
		{/if}
		{#if gallery.events.length > 0}
			<ul class="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm" aria-label="Zugehörige Termine">
				{#each gallery.events as event (event.id)}
					<li>
						<a href="/termine/{encodeURIComponent(event.id)}" class="text-blue-600 hover:underline">
							Zum Termin: {event.title}
						</a>
						<span class="text-gray-500">({formatDateRange(event)})</span>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	{#if gallery.images.length === 0}
		<p class="text-gray-500">In dieser Galerie sind noch keine Bilder.</p>
	{:else}
		<ul class="grid grid-cols-2 gap-4 md:grid-cols-3">
			{#each gallery.images as image, i (image.id)}
				<li>
					<a
						href={urlFor(i)}
						class="group block cursor-zoom-in overflow-hidden border border-gray-200 bg-gray-100"
						onclick={(event) => open(i, event)}
						aria-label="{images[i]?.alt ?? `Bild ${i + 1}`} – vergrößern"
					>
						<img
							src={galleryImageUrl(gallery.id, image.id, 'thumb')}
							alt=""
							width={image.width}
							height={image.height}
							loading={i < 9 ? 'eager' : 'lazy'}
							decoding="async"
							class="h-40 w-full object-cover transition duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 md:h-48"
						/>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</section>

{#if openIndex !== null && images.length > 0}
	<Lightbox
		{images}
		bind:index={() => openIndex ?? 0, (index) => setOpen(index)}
		title={gallery.title}
		onclose={() => setOpen(null)}
	/>
{/if}
