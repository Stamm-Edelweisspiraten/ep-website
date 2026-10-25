<script lang="ts">
    import Icon from '$lib/components/Icon.svelte';
    import Share from '$lib/components/Share.svelte';
    import EventList from '$lib/components/EventList.svelte';
    import { formatDateRange, formatLongDate, formatTimeRange, isMultiDay, time } from '$lib/dates';
    import type { PageData } from './$types';

    export let data: PageData;

    let shareOpen = false;

    $: e = data.event;
    $: dateText = isMultiDay(e) ? formatDateRange(e) : formatLongDate(e.startsOn);
    $: timeText = isMultiDay(e)
        ? [time(e.startsTime) && `Beginn ${time(e.startsTime)} Uhr`, time(e.endsTime) && `Ende ${time(e.endsTime)} Uhr`]
              .filter(Boolean)
              .join(' · ')
        : formatTimeRange(e.startsTime, e.endsTime);
    $: mapUrl = e.location
        ? `https://www.openstreetmap.org/search?query=${encodeURIComponent(e.location)}`
        : null;
    $: summary = e.description.replace(/\s+/g, ' ').trim().slice(0, 160);
    $: ogImage = e.galleries.find((g) => g.coverUrl)?.coverUrl ?? null;
    $: long = e.title.length > 22;
</script>

<svelte:head>
    <title>{e.title} – Termine – Stamm Edelweißpiraten</title>
    <meta name="description" content={summary || `${e.title} am ${dateText}`} />
    <meta property="og:type" content="article" />
    <meta property="og:title" content={e.title} />
    <meta property="og:description" content={summary || dateText} />
    <meta property="og:url" content={data.pageUrl} />
    {#if ogImage}<meta property="og:image" content={`${data.origin}${ogImage}`} />{/if}
</svelte:head>

<article class="site-container" aria-labelledby="h-termin">
    <nav class="crumbs" aria-label="Brotkrümel">
        <a href="/">Start</a><Icon name="chevron-right" size={18} /><a href="/termine">Termine</a><Icon name="chevron-right" size={18} /><span aria-current="page">{e.title}</span>
    </nav>

    <div class="topline">
        <a class="ulink" href="/termine"><Icon name="arrow-left" size={18} />Alle Termine</a>
        <button type="button" class="pill soft" aria-haspopup="dialog" on:click={() => (shareOpen = true)}><Icon name="share" size={18} />Teilen</button>
    </div>

    <header class="ehead">
        <p class="kick">
            {#if e.recurring}<Icon name="repeat" size={18} />Regelmäßiger Termin · {:else}<Icon name="calendar" size={18} />{/if}{dateText}
        </p>
        <h1 class="display {long ? 'long' : ''}" id="h-termin">{e.title}</h1>
        {#if e.groups.length || e.tags.length}
            <div class="acts">
                {#each e.groups as g (g.id)}
                    {#if g.href}
                        <a class="tag md" href={g.href}><span class="dot" style="--g: {g.color ?? 'currentColor'}"></span><span>{g.name}</span></a>
                    {:else}
                        <span class="tag md"><span class="dot" style="--g: {g.color ?? 'currentColor'}"></span><span>{g.name}</span></span>
                    {/if}
                {/each}
                {#each e.tags as t (t)}<span class="tag md"><span>{t}</span></span>{/each}
            </div>
        {/if}
    </header>

    <div class="body">
        <div class="txt">
            {#if e.description}
                <p class="desc">{e.description}</p>
            {:else}
                <p class="desc">Weitere Infos bekommst du von der Gruppenleitung.</p>
            {/if}
        </div>

        <aside class="info" aria-label="Termindaten">
            <dl>
                <div class="row"><span class="ic"><Icon name="calendar" /></span><div><dt>Datum</dt><dd class="tab">{dateText}</dd></div></div>
                {#if timeText}
                    <div class="row"><span class="ic"><Icon name="clock" /></span><div><dt>Uhrzeit</dt><dd class="tab">{timeText}</dd></div></div>
                {/if}
                {#if e.location}
                    <div class="row">
                        <span class="ic"><Icon name="map-pin" /></span>
                        <div>
                            <dt>Ort</dt>
                            <dd>
                                <span class="loc">{e.location}</span>
                                {#if mapUrl}
                                    <a class="ulink sm" href={mapUrl} target="_blank" rel="noopener noreferrer">In Karte öffnen<Icon name="external" size={16} /><span class="sr-only">(neues Fenster)</span></a>
                                {/if}
                            </dd>
                        </div>
                    </div>
                {/if}
                {#if e.groups.length}
                    <div class="row"><span class="ic"><Icon name="users" /></span><div><dt>Für wen</dt><dd>{e.groups.map((g) => g.name).join(', ')}</dd></div></div>
                {/if}
            </dl>
            <div class="acts col">
                <a class="pill" href="/kontakt">Frage an die Gruppenleitung</a>
            </div>
        </aside>
    </div>
</article>

{#if e.galleries.length}
    <section class="site-container section-gap" aria-labelledby="bilder">
        <div class="rowhead">
            <h2 id="bilder" class="h-xl">Bilder</h2>
            <a class="ulink" href="/galerie">Zur Galerie<Icon name="arrow-right" size={18} /></a>
        </div>
        <div class="grid3">
            {#each e.galleries as g (g.id)}
                <a class="tile" href={`/galerie/${g.id}`}>
                    <div class="ph">{#if g.coverUrl}<img src={g.coverUrl} alt="" width="640" height="480" loading="lazy" />{/if}</div>
                    <p class="n">{g.title}</p>
                    <p class="cap tab">{g.imageCount} {g.imageCount === 1 ? 'Bild' : 'Bilder'}</p>
                </a>
            {/each}
        </div>
    </section>
{/if}

{#if data.more.length}
    <section class="site-container section-gap" aria-labelledby="h-weitere">
        <div class="rowhead">
            <h2 class="h-xl" id="h-weitere">Weitere Termine</h2>
            <a class="ulink" href="/termine">Alle Termine<Icon name="arrow-right" size={18} /></a>
        </div>
        <EventList events={data.more} />
    </section>
{/if}

<Share
    url={data.pageUrl}
    title={e.title}
    whatsappMessage={`${e.title} am ${dateText}: ${data.pageUrl}`}
    open={shareOpen}
    onClose={() => (shareOpen = false)}
/>

<style>
    .topline {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        margin-top: 28px;
    }
    .ehead {
        margin-top: 40px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        align-items: flex-start;
    }
    .ehead h1 {
        font-size: clamp(72px, 10vw, 152px);
        overflow-wrap: anywhere;
    }
    .ehead h1.long {
        font-size: clamp(56px, 7vw, 112px);
    }
    .kick {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 500;
        flex-wrap: wrap;
    }
    .body {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 24px;
        align-items: start;
        margin-top: 48px;
    }
    .txt {
        grid-column: 1 / span 7;
    }
    .desc {
        font-size: 18px;
        line-height: 1.65;
        color: var(--color-body);
        white-space: pre-line;
        max-width: 62ch;
    }
    .info {
        grid-column: 9 / span 4;
        background: var(--color-subtle);
        padding: 28px;
        display: flex;
        flex-direction: column;
        gap: 22px;
    }
    .info dl {
        display: flex;
        flex-direction: column;
        gap: 18px;
    }
    .info .row {
        display: grid;
        grid-template-columns: 44px minmax(0, 1fr);
        gap: 14px;
        align-items: start;
    }
    .info dt {
        font-size: 14px;
        color: var(--color-muted);
    }
    .info dd {
        font-size: 17px;
        font-weight: 500;
        line-height: 1.35;
    }
    .loc {
        display: block;
        overflow-wrap: anywhere;
    }
    .ulink.sm {
        font-size: 15px;
        margin-top: 4px;
    }
    .acts.col {
        flex-direction: column;
        align-items: stretch;
    }
    @media (max-width: 50rem) {
        .ehead h1,
        .ehead h1.long {
            font-size: clamp(52px, 15vw, 96px);
        }
        .txt,
        .info {
            grid-column: 1 / -1;
        }
        .info {
            order: -1;
        }
        .desc {
            font-size: 17px;
        }
    }
</style>
