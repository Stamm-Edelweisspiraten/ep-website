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

<!-- Wie die alte Website: schlichte Überschrift oben im Inhalt, kein farbiges Band -->
<header class="container-page pt-12 {className}">
	<div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
		<div class="max-w-3xl">
			{#if eyebrow}<p class="eyebrow mb-2">{eyebrow}</p>{/if}
			<h1 class="text-3xl font-bold text-gray-800">{title}</h1>
			{#if lead}<p class="mt-3 text-lg leading-relaxed text-gray-700">{lead}</p>{/if}
		</div>
		{#if children}
			<div class="shrink-0">{@render children()}</div>
		{/if}
	</div>
</header>
