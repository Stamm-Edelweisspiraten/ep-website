<script lang="ts">
	import { afterNavigate, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import ShareButton from '$lib/components/events/ShareButton.svelte';
	import Lightbox, { type LightboxImage } from '$lib/components/Lightbox.svelte';
	import Notice from '$lib/components/Notice.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { buildSearch, galleryDate, imageCountLabel } from '$lib/events';
	import { formatDate, formatDateRange } from '$lib/format';
	import { galleryImageUrl } from '$lib/images';

	let { data } = $props();

	const gallery = $derived(data.gallery);
	const date = $derived(galleryDate(gallery));

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

<header class="border-b border-line bg-surface">
	<div class="container-page py-8 sm:py-12">
		<a href="/galerie" class="link inline-flex items-center gap-1 text-sm">
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
			Zurück zur Galerie
		</a>
		<div class="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
			<div class="max-w-3xl">
				<p class="eyebrow mb-2">
					{[date ? formatDate(date) : '', imageCountLabel(gallery.imageCount)]
						.filter(Boolean)
						.join(' · ')}
				</p>
				<h1 class="text-3xl sm:text-4xl">{gallery.title}</h1>
				{#if gallery.description}
					<p class="mt-3 text-lg leading-relaxed whitespace-pre-line text-muted">
						{gallery.description}
					</p>
				{/if}
				{#if gallery.events.length > 0}
					<ul class="mt-4 flex flex-wrap gap-2" aria-label="Zugehörige Termine">
						{#each gallery.events as event (event.id)}
							<li>
								<a
									href="/termine/{encodeURIComponent(event.id)}"
									class="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-900 hover:bg-brand-100"
								>
									<svg
										class="size-4"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										aria-hidden="true"
									>
										<rect x="3" y="5" width="18" height="16" rx="2" />
										<path stroke-linecap="round" d="M3 10h18M8 3v4m8-4v4" />
									</svg>
									{event.title}
									<span class="font-normal text-muted">({formatDateRange(event)})</span>
								</a>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
			<ShareButton title={gallery.title} class="shrink-0" />
		</div>
	</div>
</header>

<div class="container-page section-y">
	{#if gallery.images.length === 0}
		<Notice tone="info" title="" message="In dieser Galerie sind noch keine Bilder." />
	{:else}
		<ul class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
			{#each gallery.images as image, i (image.id)}
				<li>
					<a
						href={urlFor(i)}
						class="group block overflow-hidden rounded-lg bg-brand-50 focus-visible:outline-offset-2"
						onclick={(event) => open(i, event)}
						aria-label="{images[i]?.alt ?? `Bild ${i + 1}`} – vergrößern"
					>
						<img
							src={galleryImageUrl(gallery.id, image.id, 'thumb')}
							alt=""
							width={image.width}
							height={image.height}
							loading={i < 8 ? 'eager' : 'lazy'}
							decoding="async"
							class="aspect-square h-auto w-full object-cover transition duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
						/>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</div>

{#if openIndex !== null && images.length > 0}
	<Lightbox
		{images}
		bind:index={() => openIndex ?? 0, (index) => setOpen(index)}
		title={gallery.title}
		onclose={() => setOpen(null)}
	/>
{/if}
