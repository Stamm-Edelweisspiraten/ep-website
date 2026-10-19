<script lang="ts">
	/** Kachel einer Galerie wie auf der alten Website: Titelbild (`thumb`, 4:3), Titel, Datum. */
	import type { WebsiteGallery } from '$lib/server/types';
	import { galleryDateLabel, imageCountLabel } from '$lib/events';
	import { galleryImageUrl } from '$lib/images';

	let { gallery, headingLevel = 'h2' }: { gallery: WebsiteGallery; headingLevel?: 'h2' | 'h3' } =
		$props();

	const date = $derived(galleryDateLabel(gallery));
</script>

<a
	href="/galerie/{encodeURIComponent(gallery.id)}"
	class="group block h-full overflow-hidden border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
>
	<div class="aspect-[4/3] overflow-hidden bg-gray-100">
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
			<div class="flex h-full items-center justify-center text-gray-300" aria-hidden="true">
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
			class="line-clamp-2 font-semibold text-gray-900 transition group-hover:text-blue-700"
		>
			{gallery.title}
		</svelte:element>
		<p class="text-sm text-gray-500">
			{date}<span class="sr-only">, {imageCountLabel(gallery.imageCount)}</span>
		</p>
	</div>
</a>
