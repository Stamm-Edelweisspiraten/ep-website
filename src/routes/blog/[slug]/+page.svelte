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
    $: long = p.title.length > 26;
    $: initial = (p.authorName ?? '').trim().charAt(0).toUpperCase();
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

<article class="site-container" aria-labelledby="h-post">
    <nav class="crumbs" aria-label="Brotkrümel">
        <a href="/">Start</a><Icon name="chevron-right" size={18} /><a href="/blog">Blog</a><Icon name="chevron-right" size={18} /><span aria-current="page">{p.title}</span>
    </nav>

    <header class="bhead">
        <p class="cap kick">
            {#each p.tags.slice(0, 2) as t (t)}<a class="tag" href={`/blog?thema=${encodeURIComponent(t)}`}>{t}</a>{/each}
            <time datetime={p.publishedOn}>{formatLongDate(p.publishedOn)}</time>
        </p>
        <h1 class="display {long ? 'long' : ''}" id="h-post">{p.title}</h1>
        {#if p.teaser}<p class="lede">{p.teaser}</p>{/if}
        <div class="byline">
            {#if p.authorName}
                <span class="av" aria-hidden="true">{initial}</span>
                <span class="strong">{p.authorName}</span>
            {/if}
            <button type="button" class="pill soft sm" aria-haspopup="dialog" on:click={() => (shareOpen = true)}><Icon name="share" size={16} />Teilen</button>
        </div>
    </header>

    {#if p.coverLarge}
        <figure class="cover">
            <img src={p.coverLarge.url} alt={p.coverLarge.alt} width={p.coverLarge.width} height={p.coverLarge.height} decoding="async" />
        </figure>
    {/if}

    <div class="abody">
        {#if p.bodyHtml}
            <div class="richtext prose">
                <!-- serverseitig bereinigt (lib/server/rich-text.ts) -->
                {@html p.bodyHtml}
            </div>
        {:else}
            <div class="prose"></div>
        {/if}

        {#if p.tags.length || hasLinks}
            <aside class="side" aria-label="Zum Beitrag">
                {#if hasLinks}
                    <div class="sbox">
                        <h2>Dazu passend</h2>
                        {#each p.groups as g (g.id)}
                            <a class="ref" href={g.href}><span class="th"><span class="dot" style="--g: {g.color ?? 'currentColor'}; width: 14px; height: 14px"></span></span><span><b>{g.name}</b><span class="cap">Gruppe</span></span></a>
                        {/each}
                        {#if p.gallery}
                            <a class="ref" href={`/galerie/${p.gallery.id}`}><span class="th"><Icon name="images" /></span><span><b>{p.gallery.title}</b><span class="cap">Bilder</span></span></a>
                        {/if}
                        {#if p.event}
                            <a class="ref" href={`/termine/${p.event.key}`}><span class="th"><Icon name="calendar" /></span><span><b>{p.event.title}</b><span class="cap tab">Termin · {formatLongDate(p.event.startsOn)}</span></span></a>
                        {/if}
                    </div>
                {/if}
                {#if p.tags.length}
                    <div class="sbox">
                        <h2>Themen</h2>
                        <div class="acts">
                            {#each p.tags as t (t)}<a class="tag on-cloud" href={`/blog?thema=${encodeURIComponent(t)}`}>{t}</a>{/each}
                        </div>
                    </div>
                {/if}
            </aside>
        {/if}
    </div>

    <nav class="back" aria-label="Zurück zum Blog">
        <a class="pill soft" href="/blog"><Icon name="arrow-left" size={18} />Alle Beiträge</a>
    </nav>
</article>

<Share
    url={data.pageUrl}
    title={p.title}
    whatsappMessage={`${p.title}: ${data.pageUrl}`}
    open={shareOpen}
    onClose={() => (shareOpen = false)}
/>

<style>
    .bhead {
        display: flex;
        flex-direction: column;
        gap: 22px;
        align-items: flex-start;
        padding-top: 36px;
        max-width: 1000px;
    }
    .bhead h1 {
        font-size: clamp(72px, 8.4vw, 128px);
        overflow-wrap: anywhere;
    }
    .bhead h1.long {
        font-size: clamp(56px, 6vw, 96px);
    }
    .kick {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
    }
    .lede {
        font-size: 20px;
        line-height: 1.45;
        color: var(--color-body);
        max-width: 56ch;
    }
    .byline {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
    }
    .av {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--color-subtle);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        font-weight: 600;
    }
    .byline .pill {
        margin-left: 12px;
    }
    .cover {
        margin-top: 48px;
    }
    .cover img {
        display: block;
        width: 100%;
        aspect-ratio: 21 / 9;
        object-fit: cover;
    }
    .abody {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 24px;
        align-items: start;
        margin-top: 56px;
    }
    .prose {
        grid-column: 2 / span 7;
    }
    .side {
        grid-column: 10 / span 3;
        position: sticky;
        top: 24px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .sbox {
        background: var(--color-subtle);
        padding: 22px;
        display: flex;
        flex-direction: column;
        gap: 14px;
    }
    .sbox h2 {
        font-size: 15px;
        font-weight: 600;
    }
    .ref {
        display: grid;
        grid-template-columns: 56px minmax(0, 1fr);
        gap: 12px;
        align-items: center;
        text-decoration: none;
        color: var(--color-ink);
    }
    .th {
        width: 56px;
        height: 56px;
        background: var(--color-page);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .ref b {
        font-weight: 500;
        display: block;
    }
    .ref .cap {
        display: block;
    }
    .ref:hover b {
        text-decoration: underline;
        text-underline-offset: 4px;
    }
    .back {
        margin-top: 64px;
    }
    @media (max-width: 50rem) {
        .bhead h1,
        .bhead h1.long {
            font-size: clamp(48px, 14vw, 88px);
        }
        .lede {
            font-size: 18px;
        }
        .cover {
            margin-inline: calc(-1 * clamp(16px, 3.3vw, 48px));
        }
        .cover img {
            aspect-ratio: 4 / 3;
        }
        .prose,
        .side {
            grid-column: 1 / -1;
            position: static;
        }
        .byline .pill {
            margin-left: 0;
        }
    }
</style>
