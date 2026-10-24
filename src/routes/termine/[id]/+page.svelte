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

<section class="mx-auto max-w-4xl space-y-6 px-6 py-10">
    <div class="flex items-center justify-between gap-3">
        <a href="/termine" class="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:underline">
            <Icon name="arrow-left" /> Alle Termine
        </a>
        <button
            type="button"
            class="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:underline"
            on:click={() => (shareOpen = true)}
        >
            <Icon name="share" /> Teilen
        </button>
    </div>

    <article class="border border-gray-200 bg-white">
        <div class="h-2 {color ? '' : 'bg-blue-700'}" style={color ? `background-color: ${color}` : ''}></div>
        <div class="space-y-6 p-6 sm:p-8">
            <header class="space-y-3">
                {#if e.recurring}
                    <p class="inline-flex items-center gap-1.5 text-sm text-gray-500">
                        <Icon name="repeat" size={14} /> Regelmäßiger Termin
                    </p>
                {/if}
                <h1 class="text-3xl leading-tight font-bold text-gray-900">{e.title}</h1>
                {#if e.groups.length || e.tags.length}
                    <div class="flex flex-wrap gap-2">
                        {#each e.groups as g (g.id)}<Chip label={g.name} color={g.color} href={g.href} size="md" />{/each}
                        {#each e.tags as t (t)}<Chip label={t} size="md" />{/each}
                    </div>
                {/if}
            </header>

            <dl class="grid gap-4 border-y border-gray-100 py-5 sm:grid-cols-3">
                <div class="flex gap-3">
                    <dt class="mt-0.5 text-gray-400"><Icon name="calendar" size={18} /><span class="sr-only">Datum</span></dt>
                    <dd class="text-gray-800">{dateText}</dd>
                </div>
                {#if timeText}
                    <div class="flex gap-3">
                        <dt class="mt-0.5 text-gray-400"><Icon name="clock" size={18} /><span class="sr-only">Uhrzeit</span></dt>
                        <dd class="text-gray-800">{timeText}</dd>
                    </div>
                {/if}
                {#if e.location}
                    <div class="flex gap-3">
                        <dt class="mt-0.5 text-gray-400"><Icon name="map-pin" size={18} /><span class="sr-only">Ort</span></dt>
                        <dd class="min-w-0 text-gray-800">
                            <span class="block break-words">{e.location}</span>
                            {#if mapUrl}
                                <a
                                    href={mapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="mt-1 inline-flex items-center gap-1 text-sm text-blue-700 hover:underline"
                                >
                                    In Karte öffnen <Icon name="external" size={13} />
                                </a>
                            {/if}
                        </dd>
                    </div>
                {/if}
            </dl>

            {#if e.description}
                <p class="leading-relaxed whitespace-pre-line text-gray-800">{e.description}</p>
            {/if}

            {#if e.galleries.length}
                <section class="space-y-3" aria-labelledby="bilder">
                    <h2 id="bilder" class="text-lg font-semibold text-gray-900">Bilder</h2>
                    <ul class="grid gap-4 sm:grid-cols-2">
                        {#each e.galleries as g (g.id)}
                            <li>
                                <a
                                    href={`/galerie/${g.id}`}
                                    class="group flex items-center gap-4 border border-gray-200 p-3 transition hover:shadow-sm"
                                >
                                    {#if g.coverUrl}
                                        <img
                                            src={g.coverUrl}
                                            alt=""
                                            loading="lazy"
                                            class="size-20 shrink-0 object-cover"
                                        />
                                    {:else}
                                        <span class="flex size-20 shrink-0 items-center justify-center bg-gray-100 text-gray-400"
                                            ><Icon name="image" size={24} /></span
                                        >
                                    {/if}
                                    <span class="min-w-0">
                                        <span class="block font-medium text-gray-900 group-hover:text-blue-800">{g.title}</span>
                                        <span class="text-sm text-gray-500">{g.imageCount} {g.imageCount === 1 ? 'Bild' : 'Bilder'}</span>
                                    </span>
                                </a>
                            </li>
                        {/each}
                    </ul>
                </section>
            {/if}
        </div>
    </article>
</section>

<Share
    url={data.pageUrl}
    title={e.title}
    whatsappMessage={`${e.title} am ${dateText}: ${data.pageUrl}`}
    open={shareOpen}
    onClose={() => (shareOpen = false)}
/>
