<script lang="ts">
	/** Karte einer Galerie: Titelbild (`thumb`), Titel, Datum, Bildanzahl. */
	import type { WebsiteGallery } from '$lib/server/types';
	import { galleryDate, imageCountLabel } from '$lib/events';
	import { formatDate } from '$lib/format';
	import { galleryImageUrl } from '$lib/images';

	let { gallery, headingLevel = 'h2' }: { gallery: WebsiteGallery; headingLevel?: 'h2' | 'h3' } =
		$props();

	const date = $derived(galleryDate(gallery));
</script>

<a
	href="/galerie/{encodeURIComponent(gallery.id)}"
	class="group block h-full overflow-hidden rounded-card border border-line bg-surface shadow-card transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0"
>
	<div class="aspect-[4/3] overflow-hidden bg-brand-50">
		{#if gallery.cover}
			<img
				src={galleryImageUrl(gallery.id, gallery.cover.imageId, 'thumb')}
				alt=""
				width={gallery.cover.width}
				height={gallery.cover.height}
				loading="lazy"
				decoding="async"
				class="h-full w-full object-cover transition duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
			/>
		{:else}
			<div class="flex h-full items-center justify-center text-brand-300" aria-hidden="true">
				<svg
					class="size-12"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
				>
					<rect x="3" y="5" width="18" height="14" rx="2" />
					<circle cx="9" cy="10" r="1.5" />
					<path d="m4 18 5-5 4 4 3-3 4 4" />
				</svg>
			</div>
		{/if}
	</div>
	<div class="space-y-1 p-4">
		<svelte:element
			this={headingLevel}
			class="line-clamp-2 text-lg leading-snug font-semibold group-hover:text-brand-800"
		>
			{gallery.title}
		</svelte:element>
		<p class="flex flex-wrap gap-x-3 text-sm text-muted">
			{#if date}<span>{formatDate(date)}</span>{/if}
			<span>{imageCountLabel(gallery.imageCount)}</span>
		</p>
	</div>
</a>
