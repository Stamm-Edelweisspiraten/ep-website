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

<header class="border-b border-line bg-surface {className}">
	<div
		class="container-page flex flex-col gap-6 py-10 sm:py-14 md:flex-row md:items-end md:justify-between"
	>
		<div class="max-w-3xl">
			{#if eyebrow}<p class="eyebrow mb-2">{eyebrow}</p>{/if}
			<h1 class="text-3xl sm:text-4xl">{title}</h1>
			{#if lead}<p class="mt-3 text-lg leading-relaxed text-muted">{lead}</p>{/if}
		</div>
		{#if children}
			<div class="shrink-0">{@render children()}</div>
		{/if}
	</div>
</header>
