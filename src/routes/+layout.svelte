<script lang="ts">
	import '../app.css';
	import Footer from '$lib/components/Footer.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<a
	href="#inhalt"
	class="sr-only z-[60] rounded-full bg-brand-900 px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
>
	Zum Inhalt springen
</a>

<div class="flex min-h-dvh flex-col">
	<Navbar groups={data.groups} />
	<main id="inhalt" class="grow focus:outline-none" tabindex="-1">
		{@render children()}
	</main>
	<Footer />
</div>
