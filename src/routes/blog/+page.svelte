<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import Icon from '$lib/components/Icon.svelte';
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
    /** Aufmacher nur auf der ersten Seite */
    $: lead = posts && data.page === 1 ? (posts.items[0] ?? null) : null;
    $: rest = posts ? (lead ? posts.items.slice(1) : posts.items) : [];
    const initial = (name: string | null) => (name ?? '').trim().charAt(0).toUpperCase() || '·';
</script>

<Seo
    title={`${activeTag ? `${activeTag} – ` : ''}Blog – Stamm Edelweißpiraten`}
    description="Berichte und Neuigkeiten der Pfadfinder vom Stamm Edelweißpiraten aus Bremen: Fahrten, Lager und Gruppenstunden."
    path="/blog"
    noindex={data.page > 1 || !!activeTag}
    breadcrumbs={[{ name: 'Blog', path: '/blog' }]}
/>

<section class="site-container" aria-labelledby="h-blog">
    <nav class="crumbs" aria-label="Brotkrümel"><a href="/">Start</a><Icon name="chevron-right" size={18} /><span aria-current="page">Blog</span></nav>
    <div class="phead">
        <h1 class="display" id="h-blog">Blog</h1>
        <div class="side">
            <p>Berichte von Fahrten und Lagern, Neues aus den Gruppen und was sonst im Stamm passiert. Geschrieben von den Leuten, die dabei waren.</p>
            <a class="ulink" href="/blog/rss.xml"><Icon name="rss" size={18} />RSS-Feed abonnieren</a>
        </div>
    </div>

    {#if !posts}
        <p class="empty" style="margin-top: 48px">Die Beiträge konnten gerade nicht geladen werden – schau gern später noch einmal vorbei.</p>
    {:else}
        {#if posts.tags.length}
            <nav aria-label="Themen" class="chips scroll tools">
                <a href={href(null)} class="chip" aria-current={activeTag ? undefined : 'page'}>Alle</a>
                {#each posts.tags as t (t.tag)}
                    <a href={href(t.tag)} class="chip" aria-current={isActive(t.tag) ? 'page' : undefined}
                        >{t.tag}<span class="sr-only"> ({t.count} Beiträge)</span><span class="n" aria-hidden="true">{t.count}</span></a
                    >
                {/each}
            </nav>
        {/if}

        {#if posts.items.length === 0}
            <p class="empty" style="margin-top: 32px">
                {#if activeTag}
                    Zum Thema „{activeTag}“ gibt es keine Beiträge. <a href="/blog" class="text-link">Alle Beiträge</a>
                {:else if data.page > 1}
                    Auf dieser Seite gibt es keine Beiträge. <a href="/blog" class="text-link">Zur ersten Seite</a>
                {:else}
                    Noch keine Beiträge – bald gibt es hier Neues aus dem Stamm.
                {/if}
            </p>
        {:else}
            {#if lead}
                <a class="lead" href={lead.href}>
                    <div class="ph">
                        {#if lead.cover}
                            <img src={lead.cover.url.replace(/\/thumb$/, '/web')} alt="" width={lead.cover.width} height={lead.cover.height} decoding="async" />
                        {:else}
                            <span class="noimg"><img src="/logo.avif" alt="" width="676" height="1000" /></span>
                        {/if}
                    </div>
                    <div class="txt">
                        {#if lead.tags[0]}<span class="tag">{lead.tags[0]}</span>{/if}
                        <h2>{lead.title}</h2>
                        {#if lead.teaser}<p class="ex">{lead.teaser}</p>{/if}
                        <p class="cap byline">
                            {#if lead.authorName}<span class="av" aria-hidden="true">{initial(lead.authorName)}</span>{lead.authorName} · {/if}<time datetime={lead.publishedOn}>{formatLongDate(lead.publishedOn)}</time>
                        </p>
                        <span class="ulink">Weiterlesen<Icon name="arrow-right" size={18} /></span>
                    </div>
                </a>
            {/if}

            {#if rest.length}
                <ul class="posts">
                    {#each rest as post (post.slug)}
                        <li>
                            <a class="tile" href={post.href}>
                                <div class="ph">
                                    {#if post.cover}
                                        <img src={post.cover.url} alt="" width={post.cover.width} height={post.cover.height} loading="lazy" decoding="async" />
                                    {:else}
                                        <span class="noimg"><img src="/logo.avif" alt="" width="676" height="1000" loading="lazy" /></span>
                                    {/if}
                                </div>
                                <p class="cap pm">{#if post.tags[0]}<span class="tag">{post.tags[0]}</span>{/if}<time datetime={post.publishedOn}>{formatLongDate(post.publishedOn)}</time></p>
                                <h2 class="n">{post.title}</h2>
                                {#if post.teaser}<p class="ex">{post.teaser}</p>{/if}
                                {#if post.authorName}<p class="cap byline"><span class="av" aria-hidden="true">{initial(post.authorName)}</span>{post.authorName}</p>{/if}
                            </a>
                        </li>
                    {/each}
                </ul>
            {/if}

            {#if posts.pages > 1}
                <nav aria-label="Seiten" class="pager">
                    {#if data.page > 1}
                        <a href={href(activeTag, data.page - 1)} class="pill soft" rel="prev"><Icon name="arrow-left" size={18} />Neuere Beiträge</a>
                    {:else}
                        <span></span>
                    {/if}
                    <span class="cap">Seite {data.page} von {posts.pages}</span>
                    {#if data.page < posts.pages}
                        <a href={href(activeTag, data.page + 1)} class="pill soft" rel="next">Ältere Beiträge<Icon name="arrow-right" size={18} /></a>
                    {:else}
                        <span></span>
                    {/if}
                </nav>
            {/if}
        {/if}
    {/if}
</section>

<style>
    .tools {
        margin-top: 48px;
    }
    .lead {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 24px;
        align-items: center;
        margin-top: 32px;
        text-decoration: none;
        color: var(--color-ink);
    }
    .lead .ph {
        grid-column: 1 / span 7;
        overflow: hidden;
        background: var(--color-subtle);
    }
    .lead .ph img {
        display: block;
        width: 100%;
        aspect-ratio: 3 / 2;
        object-fit: cover;
        transition: transform 0.5s ease;
    }
    .lead:hover .ph img {
        transform: scale(1.015);
    }
    .lead .txt {
        grid-column: 8 / span 5;
        display: flex;
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
    }
    .lead h2 {
        font-size: clamp(30px, 3vw, 44px);
        line-height: 1.12;
        font-weight: 500;
        letter-spacing: -0.015em;
    }
    .lead:hover h2 {
        text-decoration: underline;
        text-underline-offset: 6px;
    }
    .lead .ex {
        font-size: 17px;
        color: var(--color-body);
    }
    .byline {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
    }
    .av {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--color-subtle);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 600;
        color: var(--color-ink);
    }
    .posts {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 48px 8px;
        margin-top: 72px;
    }
    .pm {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }
    .posts .ex {
        color: var(--color-body);
        display: -webkit-box;
        -webkit-line-clamp: 3;
        line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    .noimg {
        display: flex;
        aspect-ratio: 4 / 3;
        align-items: center;
        justify-content: center;
    }
    .noimg img {
        width: 22% !important;
        height: auto !important;
        aspect-ratio: auto !important;
    }
    .lead .noimg {
        aspect-ratio: 3 / 2;
    }
    .pager {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        margin-top: 64px;
        flex-wrap: wrap;
    }
    @media (max-width: 50rem) {
        .tools {
            margin-top: 32px;
        }
        .lead .ph,
        .lead .txt {
            grid-column: 1 / -1;
        }
        .posts {
            grid-template-columns: 1fr;
            gap: 36px;
            margin-top: 48px;
        }
    }
</style>
