<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    import Icon from '$lib/components/Icon.svelte';
    import Lightbox from '$lib/components/Lightbox.svelte';
    import Share from '$lib/components/Share.svelte';
    import { formatDateRange } from '$lib/dates';
    import type { PageData } from './$types';

    export let data: PageData;

    let selectedIndex: number | null = null;
    let shareOpen = false;

    $: g = data.gallery;
    $: dateText = formatDateRange({ startsOn: g.date, endsOn: g.endDate });
    $: summary = g.description.replace(/\s+/g, ' ').trim().slice(0, 160);
    $: altOf = (i: number) =>
        g.images[i]?.description ?? `Bild ${i + 1} von ${g.images.length} – ${g.title}`;
    $: lightboxImages = g.images.map((img, i) => ({
        src: img.webUrl,
        alt: altOf(i),
        caption: img.description
    }));
    $: long = g.title.length > 22;
</script>

<Seo
    title={`${g.title} – Galerie – Stamm Edelweißpiraten`}
    ogTitle={`Bilder von ${g.title}`}
    description={summary || `Bilder von ${g.title}`}
    path={`/galerie/${g.id}`}
    image={g.cover?.url ?? null}
    imageAlt={g.cover ? `Vorschaubild: ${g.title}` : null}
    breadcrumbs={[{ name: 'Galerie', path: '/galerie' }, { name: g.title, path: `/galerie/${g.id}` }]}
/>

<section class="site-container" aria-labelledby="h-album">
    <nav class="crumbs" aria-label="Brotkrümel">
        <a href="/">Start</a><Icon name="chevron-right" size={18} /><a href="/galerie">Galerie</a><Icon name="chevron-right" size={18} /><span aria-current="page">{g.title}</span>
    </nav>

    <div class="ahead">
        <h1 class="display {long ? 'long' : ''}" id="h-album">{g.title}</h1>
        <div class="side">
            {#if g.description}<p class="desc">{g.description}</p>{/if}
            <div class="acts">
                {#each g.events as e (e.key)}
                    <a class="tag md" href={`/termine/${e.key}`}><Icon name="calendar" size={16} /><span>{e.title}</span></a>
                {/each}
                {#each g.groups as x (x.id)}
                    {#if x.href}
                        <a class="tag md" href={x.href}><span class="dot" style="--g: {x.color ?? 'currentColor'}"></span><span>{x.name}</span></a>
                    {:else}
                        <span class="tag md"><span class="dot" style="--g: {x.color ?? 'currentColor'}"></span><span>{x.name}</span></span>
                    {/if}
                {/each}
                <button type="button" class="pill soft sm" aria-haspopup="dialog" data-umami-event="Teilen geöffnet" on:click={() => (shareOpen = true)}><Icon name="share" size={16} />Teilen</button>
            </div>
        </div>
    </div>
    <p class="cap ameta">
        <span><Icon name="images" size={18} />{g.imageCount} {g.imageCount === 1 ? 'Bild' : 'Bilder'}</span>
        <span><Icon name="calendar" size={18} />{dateText}</span>
    </p>

    <!-- Bilder in Spalten mit echten Seitenverhältnissen (kein Springen beim Laden) -->
    <ul class="photos">
        {#each g.images as img, i (img.id)}
            <li>
                <button type="button" class="ph" aria-label={`${altOf(i)} vergrößern`} data-umami-event="Bild vergrößert" data-umami-event-galerie={g.title} on:click={() => (selectedIndex = i)}>
                    <img
                        src={img.thumbUrl}
                        alt={altOf(i)}
                        width={img.width}
                        height={img.height}
                        loading={i < 8 ? 'eager' : 'lazy'}
                        decoding="async"
                    />
                </button>
                {#if img.description}
                    <p class="cap pd" aria-hidden="true">{img.description}</p>
                {/if}
            </li>
        {/each}
    </ul>
</section>

{#if data.more.length}
    <section class="site-container section-gap" aria-labelledby="h-weitere">
        <div class="rowhead">
            <h2 class="h-xl" id="h-weitere">Weitere Alben</h2>
            <a class="ulink" href="/galerie">Alle Alben<Icon name="arrow-right" size={18} /></a>
        </div>
        <div class="grid3">
            {#each data.more as m (m.id)}
                <a class="tile" href={`/galerie/${m.id}`}>
                    <div class="ph">{#if m.cover}<img src={m.cover.url} alt="" width={m.cover.width} height={m.cover.height} loading="lazy" decoding="async" />{/if}</div>
                    <p class="n">{m.title}</p>
                    <p class="cap tab">{m.imageCount} Bilder · {formatDateRange({ startsOn: m.date, endsOn: m.endDate })}</p>
                </a>
            {/each}
        </div>
    </section>
{/if}

{#if selectedIndex !== null}
    <Lightbox images={lightboxImages} index={selectedIndex} on:close={() => (selectedIndex = null)} />
{/if}

<Share
    url={data.pageUrl}
    title={`Bilder von ${g.title}`}
    whatsappMessage={`Schau dir die Bilder von ${g.title} an: ${data.pageUrl}`}
    open={shareOpen}
    onClose={() => (shareOpen = false)}
/>

<style>
    .ahead {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 24px;
        align-items: end;
        padding-top: 24px;
    }
    .ahead h1 {
        grid-column: 1 / span 7;
        font-size: clamp(72px, 8.4vw, 128px);
        overflow-wrap: anywhere;
    }
    .ahead h1.long {
        font-size: clamp(56px, 6.4vw, 96px);
    }
    .side {
        grid-column: 8 / span 5;
        display: flex;
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
    }
    .desc {
        font-size: 17px;
        color: var(--color-body);
        white-space: pre-line;
    }
    .ameta {
        display: flex;
        gap: 6px 20px;
        flex-wrap: wrap;
        margin-top: 28px;
        font-size: 16px;
    }
    .ameta > span {
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }
    .photos {
        columns: 4;
        column-gap: 8px;
        margin-top: 32px;
    }
    .photos li {
        break-inside: avoid;
        margin-bottom: 8px;
    }
    .ph {
        display: block;
        width: 100%;
        padding: 0;
        border: 0;
        background: var(--color-subtle);
        cursor: zoom-in;
        overflow: hidden;
    }
    .ph img {
        display: block;
        width: 100%;
        height: auto;
        transition: transform 0.4s ease;
    }
    .ph:hover img {
        transform: scale(1.03);
    }
    .pd {
        margin-top: 6px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    @media (max-width: 62rem) {
        .photos {
            columns: 3;
        }
    }
    @media (max-width: 50rem) {
        .ahead h1,
        .side {
            grid-column: 1 / -1;
        }
        .ahead h1,
        .ahead h1.long {
            font-size: clamp(52px, 15vw, 96px);
        }
        .photos {
            columns: 2;
            column-gap: 4px;
        }
        .photos li {
            margin-bottom: 4px;
        }
    }
</style>
