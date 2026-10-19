<script lang="ts">
	import '../app.css';
	import Footer from '$lib/components/Footer.svelte';
	import Instagram from '$lib/components/Instagram.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<a
	href="#inhalt"
	class="sr-only z-[60] bg-indigo-900 px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
>
	Zum Inhalt springen
</a>

<div class="flex min-h-dvh flex-col bg-white">
	<Navbar groups={data.groups} />
	<main id="inhalt" class="grow" tabindex="-1">
		{@render children()}
		<Instagram />
	</main>
	<Footer />
</div>
