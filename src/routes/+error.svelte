<script lang="ts">
	import { page } from '$app/state';
	import Seo from '$lib/components/Seo.svelte';

	const notFound = $derived(page.status === 404);
	const title = $derived(notFound ? 'Seite nicht gefunden' : 'Da ist etwas schiefgelaufen');
</script>

<Seo {title} />

<section class="container-page section-y">
	<div class="mx-auto max-w-xl text-center">
		<img src="/kreuzlilie.avif" alt="" width="96" height="96" class="mx-auto mb-6 h-24 w-auto" />
		<p class="eyebrow">Fehler {page.status}</p>
		<h1 class="mt-2 text-3xl sm:text-4xl">{title}</h1>
		<p class="mt-4 text-lg text-muted">
			{#if notFound}
				Diese Seite gibt es nicht (mehr). Vielleicht hat sich die Adresse geändert – schau dich gern
				auf der Startseite um.
			{:else}
				Bitte versuche es in ein paar Minuten noch einmal.
			{/if}
		</p>
		<div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
			<a href="/" class="btn btn-primary">Zur Startseite</a>
			<a href="/termine" class="btn btn-secondary">Termine ansehen</a>
		</div>
	</div>
</section>
