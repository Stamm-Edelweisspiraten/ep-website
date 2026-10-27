<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import Icon from '$lib/components/Icon.svelte';
    import { formatDateRange } from '$lib/dates';
    import type { SiteGroupRef } from '$lib/site-types';
    import type { PageData } from './$types';

    export let data: PageData;

    const years = [...new Set(data.galleries.map((g) => g.date.slice(0, 4)))].sort((a, b) => b.localeCompare(a));
    const groups: SiteGroupRef[] = [
        ...new Map(data.galleries.flatMap((g) => g.groups).map((g) => [g.id, g])).values()
    ].sort((a, b) => a.name.localeCompare(b.name, 'de'));

    const params = $page.url.searchParams;
    let year = years.includes(params.get('jahr') ?? '') ? params.get('jahr')! : '';
    let group = groups.find((g) => g.name.toLocaleLowerCase('de-DE') === params.get('gruppe')?.toLocaleLowerCase('de-DE'))?.id ?? '';
    let q = params.get('q') ?? '';

    const fold = (t: string) =>
        t.toLocaleLowerCase('de-DE').replace(/ß/g, 'ss').normalize('NFD').replace(/[̀-ͯ]/g, '');

    $: words = fold(q).split(/\s+/).filter(Boolean);
    $: filtered = data.galleries.filter(
        (g) =>
            (!year || g.date.startsWith(year)) &&
            (!group || g.groups.some((x) => x.id === group)) &&
            words.every((w) => fold(`${g.title} ${g.description} ${g.events.map((e) => e.title).join(' ')}`).includes(w))
    );
    $: filterActive = !!year || !!group || q.trim() !== '';

    let ready = false;
    $: if (ready) syncUrl(year, group, q);

    function syncUrl(y: string, gid: string, text: string) {
        if (!browser) return;
        const next = new URLSearchParams();
        if (y) next.set('jahr', y);
        const g = groups.find((x) => x.id === gid);
        if (g) next.set('gruppe', g.name);
        if (text.trim()) next.set('q', text.trim());
        const qs = next.toString();
        if (qs === $page.url.searchParams.toString()) return;
        goto(`/galerie${qs ? `?${qs}` : ''}`, { replaceState: true, keepFocus: true, noScroll: true });
    }

    onMount(() => (ready = true));

    $: pictures = filtered.reduce((sum, g) => sum + g.imageCount, 0);
</script>

<Seo
    title="Galerie – Stamm Edelweißpiraten"
    description="Bilder von Fahrten, Lagern und Aktionen des Stammes Edelweißpiraten."
    path="/galerie"
    image={data.galleries[0]?.cover?.url ?? null}
    breadcrumbs={[{ name: 'Galerie', path: '/galerie' }]}
/>

<section class="site-container" aria-labelledby="h-galerie">
    <nav class="crumbs" aria-label="Brotkrümel"><a href="/">Start</a><Icon name="chevron-right" size={18} /><span aria-current="page">Galerie</span></nav>
    <div class="phead">
        <h1 class="display" id="h-galerie">Galerie</h1>
        <div class="side">
            <p>Bilder von Fahrten, Lagern und Gruppenstunden. Wir zeigen nur Fotos, für die alle Abgebildeten zugestimmt haben.</p>
        </div>
    </div>

    <div class="tools">
        <label class="search">
            <span class="sr-only">Galerien durchsuchen</span>
            <Icon name="search" />
            <input type="search" bind:value={q} name="q" autocomplete="off" placeholder="Galerie suchen …" class="field" />
        </label>
        <p class="cap tab">{filtered.length} {filtered.length === 1 ? 'Album' : 'Alben'} · {pictures} Bilder</p>
    </div>
    {#if years.length > 1 || groups.length}
        <div class="chips scroll filters" role="group" aria-label="Filter">
            {#if years.length > 1}
                <button type="button" class="chip" aria-pressed={!year} on:click={() => (year = '')}>Alle Jahre</button>
                {#each years as y (y)}
                    <button type="button" class="chip" aria-pressed={year === y} on:click={() => (year = year === y ? '' : y)}>{y}</button>
                {/each}
            {/if}
            {#each groups as gr (gr.id)}
                <button type="button" class="chip" aria-pressed={group === gr.id} on:click={() => (group = group === gr.id ? '' : gr.id)}>
                    <span class="dot" style="--g: {gr.color ?? 'currentColor'}"></span>{gr.name}
                </button>
            {/each}
        </div>
    {/if}
    {#if filterActive}
        <p class="cap found" role="status">
            {filtered.length} {filtered.length === 1 ? 'Galerie' : 'Galerien'} gefunden ·
            <button type="button" class="linkbtn" on:click={() => ((year = ''), (group = ''), (q = ''))}>Filter zurücksetzen</button>
        </p>
    {/if}

    {#if filtered.length > 0}
        {@const f = filtered[0]}
        <a class="feat" href={`/galerie/${f.id}`}>
            {#if f.cover}
                <img src={f.cover.url.replace(/\/thumb$/, '/web')} alt="" width={f.cover.width} height={f.cover.height} decoding="async" />
            {/if}
            <span class="scrim"></span>
            <span class="lock">
                <span>
                    <span class="display ft">{f.title}</span>
                    <span class="fm">
                        <span><Icon name="images" />{f.imageCount} {f.imageCount === 1 ? 'Bild' : 'Bilder'}</span>
                        <span><Icon name="calendar" />{formatDateRange({ startsOn: f.date, endsOn: f.endDate })}</span>
                        {#if f.groups.length}<span><Icon name="users" />{f.groups.map((x) => x.name).join(', ')}</span>{/if}
                    </span>
                </span>
                <span class="pill white hide-m">Album ansehen<Icon name="arrow-right" size={18} /></span>
            </span>
        </a>

        {#if filtered.length > 1}
            <ul class="grid3 albums">
                {#each filtered.slice(1) as g (g.id)}
                    <li>
                        <a class="tile" href={`/galerie/${g.id}`}>
                            <div class="ph">
                                {#if g.cover}
                                    <img src={g.cover.url} alt="" width={g.cover.width} height={g.cover.height} loading="lazy" decoding="async" />
                                {:else}
                                    <span class="noimg"><Icon name="image" size={40} /></span>
                                {/if}
                                <span class="count"><Icon name="images" size={16} />{g.imageCount}<span class="sr-only"> {g.imageCount === 1 ? 'Bild' : 'Bilder'}</span></span>
                            </div>
                            <h2 class="n">{g.title}</h2>
                            <p class="cap tab">
                                {formatDateRange({ startsOn: g.date, endsOn: g.endDate })}{#if g.groups.length} · {g.groups.map((x) => x.name).join(', ')}{/if}
                            </p>
                        </a>
                    </li>
                {/each}
            </ul>
        {/if}
    {:else}
        <p class="empty" style="margin-top: 32px">
            {filterActive ? 'Keine Galerie zu diesem Filter.' : 'Noch keine Bilder veröffentlicht.'}
        </p>
    {/if}
</section>

<style>
    .tools {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 48px;
    }
    .search {
        position: relative;
        flex: 1 1 320px;
        max-width: 480px;
    }
    .search :global(svg) {
        position: absolute;
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--color-muted);
    }
    .search .field {
        border-radius: 30px;
        padding-left: 52px;
    }
    .filters,
    .found {
        margin-top: 12px;
    }
    .linkbtn {
        border: 0;
        background: none;
        padding: 0;
        font: inherit;
        color: var(--color-ink);
        font-weight: 500;
        text-decoration: underline;
        text-underline-offset: 3px;
        cursor: pointer;
    }
    .feat {
        position: relative;
        display: block;
        overflow: hidden;
        background: #111;
        margin-top: 24px;
        text-decoration: none;
        color: #fff;
    }
    .feat img {
        display: block;
        width: 100%;
        height: min(600px, 42vw);
        min-height: 380px;
        object-fit: cover;
        transition: transform 0.5s ease;
    }
    .feat:hover img {
        transform: scale(1.015);
    }
    .feat .scrim {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.64) 0%, rgba(0, 0, 0, 0.2) 42%, rgba(0, 0, 0, 0) 64%);
    }
    .feat .lock {
        position: absolute;
        left: clamp(20px, 3.3vw, 40px);
        right: clamp(20px, 3.3vw, 40px);
        bottom: clamp(20px, 3.3vw, 40px);
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 24px;
    }
    .ft {
        display: block;
        font-size: clamp(48px, 6.4vw, 96px);
        overflow-wrap: anywhere;
    }
    .fm {
        display: flex;
        gap: 6px 18px;
        flex-wrap: wrap;
        margin-top: 12px;
        font-size: 16px;
    }
    .fm > span {
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }
    .albums {
        margin-top: 40px;
    }
    .count {
        position: absolute;
        right: 12px;
        bottom: 12px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 36px;
        padding: 0 14px;
        border-radius: 30px;
        background: rgba(0, 0, 0, 0.55);
        color: #fff;
        font-size: 14px;
        font-weight: 500;
    }
    .noimg {
        display: flex;
        aspect-ratio: 4 / 3;
        align-items: center;
        justify-content: center;
        color: var(--color-muted);
    }
    @media (max-width: 50rem) {
        .tools {
            margin-top: 32px;
        }
        .search {
            max-width: none;
        }
        .feat img {
            height: 440px;
            min-height: 0;
        }
        .hide-m {
            display: none;
        }
    }
</style>
