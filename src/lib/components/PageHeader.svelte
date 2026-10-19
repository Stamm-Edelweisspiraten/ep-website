<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		/** Einleitungssatz unter dem Titel */
		lead?: string | null;
		/** Kleine Überzeile, z. B. „Gruppen“ */
		eyebrow?: string | null;
		/** Zusätzlicher Inhalt rechts bzw. unter dem Titel (z. B. Schaltflächen, Filter) */
		children?: Snippet;
		class?: string;
	}

	let { title, lead = null, eyebrow = null, children, class: className = '' }: Props = $props();
</script>

<!-- Seitenkopf aller Unterseiten: helles Band mit sanftem Verlauf in Wappenfarben -->
<header class="page-header relative overflow-hidden border-b border-line bg-white {className}">
	<div class="container-page relative py-10 sm:py-14">
		<div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
			<div class="max-w-3xl">
				{#if eyebrow}<p class="eyebrow mb-3">{eyebrow}</p>{/if}
				<h1 class="text-3xl font-extrabold sm:text-4xl">{title}</h1>
				{#if lead}<p class="mt-4 text-lg leading-relaxed text-muted">{lead}</p>{/if}
			</div>
			{#if children}
				<div class="shrink-0">{@render children()}</div>
			{/if}
		</div>
	</div>
</header>

<style>
	.page-header {
		background-image:
			radial-gradient(
				60rem 18rem at 100% 0%,
				color-mix(in srgb, var(--color-brand-100) 70%, transparent),
				transparent 70%
			),
			radial-gradient(
				30rem 12rem at 0% 100%,
				color-mix(in srgb, var(--color-sun-300) 25%, transparent),
				transparent 70%
			);
	}
</style>
