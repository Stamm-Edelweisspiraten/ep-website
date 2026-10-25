<script lang="ts">
    import { formatLongDate } from '$lib/dates';
    import type { PageData } from './$types';

    export let data: PageData;

    /** Adresse mit Thema und Seite (Seite 1 und „alle Themen“ ohne Parameter) */
    function href(tag: string | null, page = 1) {
        const params = new URLSearchParams();
        if (tag) params.set('thema', tag);
        if (page > 1) params.set('seite', String(page));
        const qs = params.toString();
        return qs ? `/blog?${qs}` : '/blog';
    }

    $: posts = data.posts;
    $: activeTag = data.tag;
    $: isActive = (tag: string) => activeTag?.toLocaleLowerCase('de') === tag.toLocaleLowerCase('de');
</script>

<svelte:head>
    <title>{activeTag ? `${activeTag} – ` : ''}Blog – Stamm Edelweißpiraten</title>
    <meta name="description" content="Berichte und Neuigkeiten aus dem Stamm Edelweißpiraten: Fahrten, Lager und Gruppenstunden." />
    {#if data.page > 1 || activeTag}<meta name="robots" content="noindex, follow" />{/if}
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
    <h1 class="text-display text-ink">Blog</h1>
    <p class="mt-3 text-lede">Berichte und Neuigkeiten aus dem Stamm. <a href="/blog/rss.xml" class="text-link">RSS-Feed</a></p>

    {#if !posts}
        <p class="mt-8 border border-notice-line bg-notice px-5 py-4 text-ink">
            Die Beiträge konnten gerade nicht geladen werden – schau gern später noch einmal vorbei.
        </p>
    {:else}
        {#if posts.tags.length}
            <nav aria-label="Themen" class="mt-6">
                <ul class="flex flex-wrap gap-2">
                    <li>
                        <a
                            href={href(null)}
                            class="inline-block border px-3 py-1 text-small {activeTag
                                ? 'border-line-strong text-body hover:bg-subtle'
                                : 'border-ink bg-ink text-page'}"
                            aria-current={activeTag ? undefined : 'page'}>Alle</a
                        >
                    </li>
                    {#each posts.tags as t (t.tag)}
                        <li>
                            <a
                                href={href(t.tag)}
                                class="inline-block border px-3 py-1 text-small {isActive(t.tag)
                                    ? 'border-ink bg-ink text-page'
                                    : 'border-line-strong text-body hover:bg-subtle'}"
                                aria-current={isActive(t.tag) ? 'page' : undefined}
                                >{t.tag} <span class="sr-only">({t.count} Beiträge)</span><span aria-hidden="true" class="opacity-70">{t.count}</span></a
                            >
                        </li>
                    {/each}
                </ul>
            </nav>
        {/if}

        {#if posts.items.length === 0}
            <p class="mt-10 text-muted">
                {#if activeTag}
                    Zum Thema „{activeTag}“ gibt es keine Beiträge. <a href="/blog" class="text-link">Alle Beiträge</a>
                {:else if data.page > 1}
                    Auf dieser Seite gibt es keine Beiträge. <a href="/blog" class="text-link">Zur ersten Seite</a>
                {:else}
                    Noch keine Beiträge – bald gibt es hier Neues aus dem Stamm.
                {/if}
            </p>
        {:else}
            <ul class="mt-8 border-t border-line">
                {#each posts.items as post (post.slug)}
                    <li class="border-b border-line py-7">
                        <article class="grid gap-4 sm:grid-cols-[minmax(0,1fr)_200px] sm:gap-7">
                            <div class="min-w-0">
                                <p class="text-small text-muted">
                                    <time datetime={post.publishedOn}>{formatLongDate(post.publishedOn)}</time>{#if post.authorName}{` · von ${post.authorName}`}{/if}
                                </p>
                                <h2 class="mt-1 text-sub">
                                    <a href={post.href} class="text-ink hover:underline">{post.title}</a>
                                </h2>
                                {#if post.teaser}<p class="mt-2">{post.teaser}</p>{/if}
                                {#if post.tags.length}
                                    <p class="mt-2 text-small text-muted">
                                        Themen:
                                        {#each post.tags as t, i (t)}<a href={href(t)} class="text-link">{t}</a>{i < post.tags.length - 1 ? ', ' : ''}{/each}
                                    </p>
                                {/if}
                            </div>
                            {#if post.cover}
                                <a href={post.href} class="order-first block sm:order-none" tabindex="-1" aria-hidden="true">
                                    <img
                                        src={post.cover.url}
                                        alt=""
                                        width={post.cover.width}
                                        height={post.cover.height}
                                        loading="lazy"
                                        decoding="async"
                                        class="h-auto w-full"
                                    />
                                </a>
                            {/if}
                        </article>
                    </li>
                {/each}
            </ul>

            {#if posts.pages > 1}
                <nav aria-label="Seiten" class="mt-6 flex items-center justify-between gap-4">
                    {#if data.page > 1}
                        <a href={href(activeTag, data.page - 1)} class="text-link" rel="prev">Neuere Beiträge</a>
                    {:else}
                        <span></span>
                    {/if}
                    <span class="text-small text-muted">Seite {data.page} von {posts.pages}</span>
                    {#if data.page < posts.pages}
                        <a href={href(activeTag, data.page + 1)} class="text-link" rel="next">Ältere Beiträge</a>
                    {:else}
                        <span></span>
                    {/if}
                </nav>
            {/if}
        {/if}
    {/if}
</div>
