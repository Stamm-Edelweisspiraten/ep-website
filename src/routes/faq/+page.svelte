<script lang="ts">
    import FaqList from '$lib/components/FaqList.svelte';
    import type { PageData } from './$types';

    export let data: PageData;
</script>

<svelte:head>
    <title>Häufige Fragen – Stamm Edelweißpiraten</title>
    <meta name="description" content="Antworten auf häufige Fragen zu Gruppenstunden, Alter, Kosten und Ausrüstung beim Stamm Edelweißpiraten." />
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
    <h1 class="text-display text-ink">Häufige Fragen</h1>
    <p class="mt-3 text-lede">Deine Frage ist nicht dabei? <a href="/kontakt" class="text-link">Schreib uns</a>.</p>
    <div class="mt-10">
        {#if data.faqs.length}
            <FaqList faqs={data.faqs} />
        {:else}
            <p class="text-muted">Gerade sind hier keine Fragen eingetragen.</p>
        {/if}
    </div>
</div>
