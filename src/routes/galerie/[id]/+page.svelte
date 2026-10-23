<script lang="ts">
    import Chip from '$lib/components/Chip.svelte';
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
</script>

<svelte:head>
    <title>{g.title} – Galerie – Stamm Edelweißpiraten</title>
    <meta name="description" content={summary || `Bilder von ${g.title}`} />
    <meta property="og:type" content="article" />
    <meta property="og:title" content={`Bilder von ${g.title}`} />
    <meta property="og:description" content={summary} />
    <meta property="og:url" content={data.pageUrl} />
    {#if data.firstImage}
        <meta property="og:image" content={data.firstImage} />
        <meta property="og:image:alt" content={`Vorschaubild: ${g.title}`} />
    {/if}
    <meta name="twitter:card" content={data.firstImage ? 'summary_large_image' : 'summary'} />
</svelte:head>

<section class="mx-auto max-w-6xl space-y-6 px-6 py-10">
    <div class="flex items-center justify-between gap-3">
        <a href="/galerie" class="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:underline">
            <Icon name="arrow-left" /> Alle Galerien
        </a>
        <button
            type="button"
            class="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:underline"
            on:click={() => (shareOpen = true)}
        >
            <Icon name="share" /> Teilen
        </button>
    </div>

    <header class="space-y-3">
        <h1 class="text-3xl leading-tight font-bold text-gray-900">{g.title}</h1>
        <p class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
            <span class="inline-flex items-center gap-1.5"><Icon name="calendar" size={14} />{dateText}</span>
            <span class="inline-flex items-center gap-1.5"
                ><Icon name="images" size={14} />{g.imageCount} {g.imageCount === 1 ? 'Bild' : 'Bilder'}</span
            >
        </p>
        {#if g.groups.length}
            <div class="flex flex-wrap gap-2">
                {#each g.groups as x (x.id)}<Chip label={x.name} color={x.color} href={x.href} />{/each}
            </div>
        {/if}
        {#if g.description}
            <p class="max-w-3xl leading-relaxed whitespace-pre-line text-gray-800">{g.description}</p>
        {/if}
        {#if g.events.length}
            <p class="text-sm text-gray-600">
                Zum Termin:
                {#each g.events as e, i (e.key)}
                    <a href={`/termine/${e.key}`} class="text-blue-700 hover:underline">{e.title}</a
                    >{i < g.events.length - 1 ? ', ' : ''}
                {/each}
            </p>
        {/if}
    </header>

    <!-- Bilder in Spalten mit echten Seitenverhältnissen (kein Springen beim Laden) -->
    <ul class="columns-2 gap-3 md:columns-3 lg:columns-4 [&>li]:mb-3">
        {#each g.images as img, i (img.id)}
            <li class="break-inside-avoid">
                <button
                    type="button"
                    class="group block w-full overflow-hidden bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                    aria-label={`${altOf(i)} vergrößern`}
                    on:click={() => (selectedIndex = i)}
                >
                    <img
                        src={img.thumbUrl}
                        alt={altOf(i)}
                        width={img.width}
                        height={img.height}
                        loading={i < 8 ? 'eager' : 'lazy'}
                        decoding="async"
                        class="h-auto w-full transition duration-300 group-hover:scale-[1.03] group-hover:opacity-95"
                    />
                </button>
                {#if img.description}
                    <p class="mt-1 line-clamp-2 text-xs text-gray-600">{img.description}</p>
                {/if}
            </li>
        {/each}
    </ul>
</section>

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
