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

<section class="container-page space-y-8 py-10 sm:py-14">
	<div class="flex items-center justify-between gap-3">
		<a href="/galerie" class="link-more text-sm">
			<span aria-hidden="true">←</span> Zurück zur Galerie
		</a>
		<ShareButton title={`Bilder von ${gallery.title}`} />
	</div>

	<div class="max-w-3xl">
		<p class="eyebrow mb-2">Galerie</p>
		<h1 class="text-3xl font-extrabold sm:text-4xl">{gallery.title}</h1>
		<p class="mt-2 font-medium text-muted">
			{[dateLabel, imageCountLabel(gallery.imageCount)].filter(Boolean).join(' · ')}
		</p>
		{#if gallery.description}
			<p class="mt-4 text-lg leading-relaxed whitespace-pre-line text-gray-700">
				{gallery.description}
			</p>
		{/if}
		{#if gallery.events.length > 0}
			<ul class="mt-4 flex flex-wrap gap-2 text-sm" aria-label="Zugehörige Termine">
				{#each gallery.events as event (event.id)}
					<li>
						<a
							href="/termine/{encodeURIComponent(event.id)}"
							class="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 font-medium text-ink transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
						>
							Zum Termin: {event.title}
							<span class="text-muted">({formatDateRange(event)})</span>
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	{#if gallery.images.length === 0}
		<p class="text-muted">In dieser Galerie sind noch keine Bilder.</p>
	{:else}
		<ul class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
			{#each gallery.images as image, i (image.id)}
				<li>
					<a
						href={urlFor(i)}
						class="group block cursor-zoom-in overflow-hidden rounded-xl bg-soft shadow-card"
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
							class="aspect-square h-auto w-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
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
