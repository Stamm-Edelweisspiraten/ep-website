<script lang="ts">
    import Chip from '$lib/components/Chip.svelte';
    import Icon from '$lib/components/Icon.svelte';
    import Share from '$lib/components/Share.svelte';
    import { formatDateRange, formatLongDate, formatTimeRange, isMultiDay, time } from '$lib/dates';
    import { eventColor } from '$lib/event-view';
    import type { PageData } from './$types';

    export let data: PageData;

    let shareOpen = false;

    $: e = data.event;
    $: color = eventColor(e);
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

<section class="site-container py-10">
<div class="mx-auto max-w-4xl space-y-6">
    <div class="flex items-center justify-between gap-3">
        <a href="/termine" class="inline-flex items-center gap-1.5 text-small text-link transition-colors hover:text-link-hover hover:underline">
            <Icon name="arrow-left" /> Alle Termine
        </a>
        <button
            type="button"
            class="inline-flex items-center gap-1.5 text-small text-link transition-colors hover:text-link-hover hover:underline"
            aria-haspopup="dialog"
            on:click={() => (shareOpen = true)}
        >
            <Icon name="share" /> Teilen
        </button>
    </div>

    <article class="border border-line bg-surface">
        <div class="h-2 {color ? '' : 'bg-brand'}" style={color ? `background-color: ${color}` : ''} aria-hidden="true"></div>
        <div class="space-y-6 p-6 sm:p-8">
            <header class="space-y-3">
                {#if e.recurring}
                    <p class="inline-flex items-center gap-1.5 text-small text-muted">
                        <Icon name="repeat" size={14} /> Regelmäßiger Termin
                    </p>
                {/if}
                <h1 class="text-display text-ink">{e.title}</h1>
                {#if e.groups.length || e.tags.length}
                    <div class="flex flex-wrap gap-2">
                        {#each e.groups as g (g.id)}<Chip label={g.name} color={g.color} href={g.href} size="md" />{/each}
                        {#each e.tags as t (t)}<Chip label={t} size="md" />{/each}
                    </div>
                {/if}
            </header>

            <dl class="grid gap-4 border-y border-line py-5 sm:grid-cols-3">
                <div class="flex gap-3">
                    <dt class="mt-0.5 text-muted"><Icon name="calendar" size={18} /><span class="sr-only">Datum</span></dt>
                    <dd class="text-ink tabular-nums">{dateText}</dd>
                </div>
                {#if timeText}
                    <div class="flex gap-3">
                        <dt class="mt-0.5 text-muted"><Icon name="clock" size={18} /><span class="sr-only">Uhrzeit</span></dt>
                        <dd class="text-ink tabular-nums">{timeText}</dd>
                    </div>
                {/if}
                {#if e.location}
                    <div class="flex gap-3">
                        <dt class="mt-0.5 text-muted"><Icon name="map-pin" size={18} /><span class="sr-only">Ort</span></dt>
                        <dd class="min-w-0 text-ink">
                            <span class="block break-words">{e.location}</span>
                            {#if mapUrl}
                                <a
                                    href={mapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="mt-1 inline-flex items-center gap-1 text-small text-link transition-colors hover:text-link-hover hover:underline"
                                >
                                    In Karte öffnen <Icon name="external" size={13} /><span class="sr-only">(neues Fenster)</span>
                                </a>
                            {/if}
                        </dd>
                    </div>
                {/if}
            </dl>

            {#if e.description}
                <p class="text-base leading-relaxed whitespace-pre-line text-body">{e.description}</p>
            {/if}

            {#if e.galleries.length}
                <section class="space-y-3" aria-labelledby="bilder">
                    <h2 id="bilder" class="text-section text-ink">Bilder</h2>
                    <ul class="grid gap-4 sm:grid-cols-2">
                        {#each e.galleries as g (g.id)}
                            <li>
                                <a
                                    href={`/galerie/${g.id}`}
                                    class="group flex items-center gap-4 border border-line p-3 transition-colors hover:border-muted"
                                >
                                    {#if g.coverUrl}
                                        <img
                                            src={g.coverUrl}
                                            alt=""
                                            width="80"
                                            height="80"
                                            loading="lazy"
                                            class="size-20 shrink-0 object-cover"
                                        />
                                    {:else}
                                        <span class="flex size-20 shrink-0 items-center justify-center bg-subtle text-muted"
                                            ><Icon name="image" size={24} /></span
                                        >
                                    {/if}
                                    <span class="min-w-0">
                                        <span class="block font-medium text-ink transition-colors group-hover:text-link">{g.title}</span>
                                        <span class="text-small text-muted tabular-nums">{g.imageCount} {g.imageCount === 1 ? 'Bild' : 'Bilder'}</span>
                                    </span>
                                </a>
                            </li>
                        {/each}
                    </ul>
                </section>
            {/if}
        </div>
    </article>
</div>
</section>

<Share
    url={data.pageUrl}
    title={e.title}
    whatsappMessage={`${e.title} am ${dateText}: ${data.pageUrl}`}
    open={shareOpen}
    onClose={() => (shareOpen = false)}
/>
