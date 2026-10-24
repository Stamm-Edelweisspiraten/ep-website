<script lang="ts">
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import Chip from '$lib/components/Chip.svelte';
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

    const chipClass = (on: boolean) =>
        `rounded border px-3 py-1 text-sm transition ${
            on ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
        }`;
</script>

<svelte:head>
    <title>Galerie – Stamm Edelweißpiraten</title>
    <meta name="description" content="Bilder von Fahrten, Lagern und Aktionen des Stammes Edelweißpiraten." />
</svelte:head>

<section class="mx-auto max-w-6xl space-y-6 px-6 py-12">
    <header>
        <h1 class="text-3xl font-bold text-gray-900">Galerie</h1>
        <p class="mt-1 text-gray-600">Einblicke in unsere Fahrten, Lager und Aktionen.</p>
    </header>

    <div class="space-y-3 border-y border-gray-200 py-4">
        <div class="relative max-w-md">
            <span class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"><Icon name="search" /></span>
            <input
                type="search"
                bind:value={q}
                placeholder="Galerie suchen …"
                aria-label="Galerien durchsuchen"
                class="h-10 w-full border border-gray-300 pr-3 pl-9 text-sm focus:border-blue-700 focus:outline-none"
            />
        </div>
        {#if years.length > 1}
            <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Jahr">
                <span class="mr-1 text-sm text-gray-500">Jahr</span>
                <button type="button" class={chipClass(!year)} aria-pressed={!year} on:click={() => (year = '')}>Alle</button>
                {#each years as y (y)}
                    <button type="button" class={chipClass(year === y)} aria-pressed={year === y} on:click={() => (year = year === y ? '' : y)}>{y}</button>
                {/each}
            </div>
        {/if}
        {#if groups.length}
            <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Gruppe">
                <span class="mr-1 text-sm text-gray-500">Gruppe</span>
                {#each groups as g (g.id)}
                    <button
                        type="button"
                        class="inline-flex items-center gap-1.5 {chipClass(group === g.id)}"
                        aria-pressed={group === g.id}
                        on:click={() => (group = group === g.id ? '' : g.id)}
                    >
                        <span
                            class="size-2.5 rounded-full {g.color ? '' : 'bg-gray-400'}"
                            style={g.color ? `background-color: ${g.color}` : ''}
                            aria-hidden="true"
                        ></span>
                        {g.name}
                    </button>
                {/each}
            </div>
        {/if}
        {#if filterActive}
            <div class="flex items-center gap-3 text-sm text-gray-600">
                <span>{filtered.length} {filtered.length === 1 ? 'Galerie' : 'Galerien'} gefunden</span>
                <button
                    type="button"
                    class="text-blue-700 underline hover:text-blue-900"
                    on:click={() => ((year = ''), (group = ''), (q = ''))}>Filter zurücksetzen</button
                >
            </div>
        {/if}
    </div>

    {#if filtered.length > 0}
        <ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {#each filtered as g (g.id)}
                <li>
                    <a
                        href={`/galerie/${g.id}`}
                        class="group flex h-full flex-col overflow-hidden border border-gray-200 bg-white transition hover:border-gray-400"
                    >
                        <div class="relative aspect-[4/3] overflow-hidden bg-gray-100">
                            {#if g.cover}
                                <img
                                    src={g.cover.url}
                                    alt=""
                                    width={g.cover.width}
                                    height={g.cover.height}
                                    loading="lazy"
                                    decoding="async"
                                    class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />
                            {:else}
                                <span class="flex h-full items-center justify-center text-gray-400"><Icon name="image" size={40} /></span>
                            {/if}
                            <span class="absolute right-2 bottom-2 inline-flex items-center gap-1 bg-black/65 px-2 py-0.5 text-xs text-white">
                                <Icon name="images" size={12} />{g.imageCount}
                            </span>
                        </div>
                        <div class="flex flex-1 flex-col gap-1.5 p-4">
                            <h2 class="line-clamp-2 font-semibold text-gray-900 group-hover:text-blue-800">{g.title}</h2>
                            <p class="text-sm text-gray-500">{formatDateRange({ startsOn: g.date, endsOn: g.endDate })}</p>
                            {#if g.groups.length}
                                <div class="mt-auto flex flex-wrap gap-1.5 pt-2">
                                    {#each g.groups as x (x.id)}<Chip label={x.name} color={x.color} />{/each}
                                </div>
                            {/if}
                        </div>
                    </a>
                </li>
            {/each}
        </ul>
    {:else}
        <p class="border border-dashed border-gray-300 p-8 text-center text-gray-500">
            {filterActive ? 'Keine Galerie zu diesem Filter.' : 'Noch keine Bilder veröffentlicht.'}
        </p>
    {/if}
</section>
