<script lang="ts">
	/** Kachel einer Galerie: Titelbild (`thumb`, 4:3), Titel, Datum und Bildanzahl. */
	import type { WebsiteGallery } from '$lib/server/types';
	import { galleryDateLabel, imageCountLabel } from '$lib/events';
	import { galleryImageUrl } from '$lib/images';

	let { gallery, headingLevel = 'h2' }: { gallery: WebsiteGallery; headingLevel?: 'h2' | 'h3' } =
		$props();

	const date = $derived(galleryDateLabel(gallery));
</script>

<a
	href="/galerie/{encodeURIComponent(gallery.id)}"
	class="card card-hover group block h-full overflow-hidden"
>
	<div class="relative aspect-[4/3] overflow-hidden bg-soft">
		{#if gallery.cover}
			<img
				src={galleryImageUrl(gallery.id, gallery.cover.imageId, 'thumb')}
				alt=""
				width={gallery.cover.width}
				height={gallery.cover.height}
				loading="lazy"
				decoding="async"
				class="h-full w-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
			/>
		{:else}
			<div class="flex h-full items-center justify-center text-brand-200" aria-hidden="true">
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
		<span
			class="absolute right-3 bottom-3 rounded-full bg-black/55 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm"
			aria-hidden="true"
		>
			{imageCountLabel(gallery.imageCount)}
		</span>
	</div>
	<div class="space-y-1 p-4 sm:p-5">
		<svelte:element
			this={headingLevel}
			class="line-clamp-2 font-bold text-ink transition-colors group-hover:text-brand-700"
		>
			{gallery.title}
		</svelte:element>
		<p class="text-sm text-muted">
			{date}<span class="sr-only">, {imageCountLabel(gallery.imageCount)}</span>
		</p>
	</div>
</a>
