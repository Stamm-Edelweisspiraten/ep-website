<script lang="ts">
    import Icon from '$lib/components/Icon.svelte';
    import Share from '$lib/components/Share.svelte';
    import { formatLongDate } from '$lib/dates';
    import type { PageData } from './$types';

    export let data: PageData;

    let shareOpen = false;

    $: p = data.post;
    $: summary = (p.teaser ?? '').replace(/\s+/g, ' ').trim().slice(0, 200);
    $: ogImage = p.coverLarge?.url ?? null;
    $: hasLinks = p.groups.length > 0 || !!p.event || !!p.gallery;
</script>

<svelte:head>
    <title>{p.title} – Blog – Stamm Edelweißpiraten</title>
    <meta name="description" content={summary || p.title} />
    <meta property="og:type" content="article" />
    <meta property="og:title" content={p.title} />
    {#if summary}<meta property="og:description" content={summary} />{/if}
    <meta property="og:url" content={data.pageUrl} />
    <meta property="article:published_time" content={p.publishedAt} />
    {#if ogImage}<meta property="og:image" content={`${data.origin}${ogImage}`} />{/if}
    <link rel="canonical" href={data.pageUrl} />
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
    <div class="flex items-center justify-between gap-3 text-small">
        <a href="/blog" class="inline-flex items-center gap-1.5 text-link hover:underline">
            <Icon name="arrow-left" /> Alle Beiträge
        </a>
        <button type="button" class="inline-flex items-center gap-1.5 text-link hover:underline" on:click={() => (shareOpen = true)}>
            <Icon name="share" /> Teilen
        </button>
    </div>

    <article class="mt-8">
        <header>
            <h1 class="text-display text-ink">{p.title}</h1>
            <p class="mt-3 text-muted">
                <time datetime={p.publishedOn}>{formatLongDate(p.publishedOn)}</time>{#if p.authorName}{` · von ${p.authorName}`}{/if}
            </p>
        </header>

        {#if p.coverLarge}
            <img
                src={p.coverLarge.url}
                alt={p.coverLarge.alt}
                width={p.coverLarge.width}
                height={p.coverLarge.height}
                decoding="async"
                class="mt-8 h-auto w-full"
            />
        {/if}

        {#if p.teaser}
            <p class="mt-8 max-w-[68ch] text-lede text-ink">{p.teaser}</p>
        {/if}

        {#if p.bodyHtml}
            <div class="richtext mt-6">
                <!-- serverseitig bereinigt (lib/server/rich-text.ts) -->
                {@html p.bodyHtml}
            </div>
        {/if}

        {#if p.tags.length || hasLinks}
            <footer class="mt-10 space-y-2 border-t border-line pt-5">
                {#if p.tags.length}
                    <p>
                        <span class="text-muted">Themen:</span>
                        {#each p.tags as t, i (t)}<a href={`/blog?thema=${encodeURIComponent(t)}`} class="text-link">{t}</a>{i < p.tags.length - 1 ? ', ' : ''}{/each}
                    </p>
                {/if}
                {#if p.groups.length}
                    <p>
                        <span class="text-muted">{p.groups.length === 1 ? 'Gruppe' : 'Gruppen'}:</span>
                        {#each p.groups as g, i (g.id)}<a href={g.href} class="group-name font-semibold hover:underline" style="--g: {g.color ?? '#33338c'}">{g.name}</a>{i < p.groups.length - 1 ? ', ' : ''}{/each}
                    </p>
                {/if}
                {#if p.event}
                    <p>
                        <span class="text-muted">Termin:</span>
                        <a href={`/termine/${p.event.key}`} class="text-link">{p.event.title}</a>
                        <span class="text-muted">({formatLongDate(p.event.startsOn)})</span>
                    </p>
                {/if}
                {#if p.gallery}
                    <p>
                        <span class="text-muted">Bilder:</span>
                        <a href={`/galerie/${p.gallery.id}`} class="text-link">{p.gallery.title}</a>
                    </p>
                {/if}
            </footer>
        {/if}
    </article>
</div>

<Share
    url={data.pageUrl}
    title={p.title}
    whatsappMessage={`${p.title}: ${data.pageUrl}`}
    open={shareOpen}
    onClose={() => (shareOpen = false)}
/>
