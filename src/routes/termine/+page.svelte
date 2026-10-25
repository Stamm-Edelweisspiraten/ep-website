<script lang="ts">
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import Chip from '$lib/components/Chip.svelte';
    import Icon from '$lib/components/Icon.svelte';
    import MonthCalendar from '$lib/components/MonthCalendar.svelte';
    import { dayParts, formatDateRange, formatMonth, formatTimeRange, isMultiDay } from '$lib/dates';
    import {
        collectGroups,
        collectTags,
        eventColor,
        filterEvents,
        groupByMonth,
        splitSingles,
        summarizeSeries
    } from '$lib/event-view';
    import type { SiteEvent } from '$lib/site-types';
    import type { PageData } from './$types';

    export let data: PageData;

    type View = 'kalender' | 'kacheln' | 'liste';
    const VIEWS: { id: View; label: string; icon: 'calendar' | 'grid' | 'list' }[] = [
        { id: 'kalender', label: 'Kalender', icon: 'calendar' },
        { id: 'kacheln', label: 'Kacheln', icon: 'grid' },
        { id: 'liste', label: 'Liste', icon: 'list' }
    ];
    const VIEW_KEY = 'termine:ansicht';
    const PAGE_SIZE = 12;

    const groups = collectGroups(data.events);
    const tags = collectTags(data.events);

    // --- Zustand aus der URL (alte Links `?tags=<Name>&year=` der Gruppenseiten bleiben gültig)
    const params = $page.url.searchParams;
    const lower = (v: string) => v.trim().toLocaleLowerCase('de-DE');
    const legacy = params.getAll('tags').map(lower);
    const wantedGroups = [...params.getAll('gruppe').map(lower), ...legacy];
    const wantedTags = [...params.getAll('thema').map(lower), ...legacy];

    let view: View = (VIEWS.find((v) => v.id === params.get('ansicht'))?.id ?? 'kalender') as View;
    let selectedGroups = groups.filter((g) => wantedGroups.includes(lower(g.name))).map((g) => g.id);
    let selectedTags = tags.filter((t) => wantedTags.includes(lower(t)));
    let q = params.get('q') ?? '';
    let month = /^\d{4}-\d{2}$/.test(params.get('monat') ?? '')
        ? params.get('monat')!
        : data.today.slice(0, 7);
    let showPast = false;
    let visibleCount = PAGE_SIZE;

    $: filtered = filterEvents(data.events, { groups: selectedGroups, tags: selectedTags, q });
    $: series = summarizeSeries(filtered, data.today);
    $: singles = splitSingles(filtered, data.today);
    $: upcomingShown = singles.upcoming.slice(0, visibleCount);
    $: calendarItems = filtered.map((e) => ({
        id: e.id,
        key: e.key,
        href: `/termine/${e.key}`,
        title: e.title,
        color: eventColor(e),
        startsOn: e.startsOn,
        startsTime: e.startsTime,
        endsOn: e.endsOn,
        endsTime: e.endsTime,
        recurring: e.recurring
    }));
    $: filterActive = selectedGroups.length > 0 || selectedTags.length > 0 || q.trim() !== '';

    // --- URL aktuell halten (ohne neuen Verlaufseintrag)
    let ready = false;
    $: if (ready) syncUrl(view, selectedGroups, selectedTags, q, month);

    function syncUrl(v: View, gs: string[], ts: string[], text: string, m: string) {
        if (!browser) return;
        const next = new URLSearchParams();
        if (v !== 'kalender') next.set('ansicht', v);
        for (const id of gs) {
            const g = groups.find((x) => x.id === id);
            if (g) next.append('gruppe', g.name);
        }
        for (const t of ts) next.append('thema', t);
        if (text.trim()) next.set('q', text.trim());
        if (v === 'kalender' && m !== data.today.slice(0, 7)) next.set('monat', m);
        const qs = next.toString();
        if (qs === $page.url.searchParams.toString()) return;
        goto(`/termine${qs ? `?${qs}` : ''}`, { replaceState: true, keepFocus: true, noScroll: true });
    }

    function setView(v: View) {
        view = v;
        try {
            localStorage.setItem(VIEW_KEY, v);
        } catch {
            // ohne Speicher (privater Modus) nur für diesen Besuch
        }
    }

    function toggle<T>(list: T[], value: T): T[] {
        return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
    }

    function resetFilters() {
        selectedGroups = [];
        selectedTags = [];
        q = '';
        visibleCount = PAGE_SIZE;
    }

    function timeOf(e: SiteEvent) {
        return formatTimeRange(e.startsTime, e.endsTime, isMultiDay(e));
    }

    onMount(() => {
        if (!params.get('ansicht')) {
            try {
                const saved = localStorage.getItem(VIEW_KEY);
                if (saved && VIEWS.some((v) => v.id === saved)) view = saved as View;
            } catch {
                // Speicher nicht verfügbar
            }
        }
        ready = true;
    });
</script>

<svelte:head>
    <title>Termine – Stamm Edelweißpiraten</title>
    <meta
        name="description"
        content="Gruppenstunden, Fahrten und Aktionen des Stammes Edelweißpiraten in Bremen-Hastedt."
    />
</svelte:head>

{#snippet row(e: SiteEvent)}
    {@const d = dayParts(e.startsOn)}
    {@const color = eventColor(e)}
    <li>
        <a href={`/termine/${e.key}`} class="flex items-stretch gap-4 px-4 py-3 transition-colors hover:bg-subtle">
            <span
                class="flex w-14 shrink-0 flex-col items-center justify-center border-l-4 bg-subtle py-1 text-center {color
                    ? ''
                    : 'border-brand'}"
                style={color ? `border-color: ${color}` : ''}
            >
                <span class="text-small text-muted">{d.weekday}</span>
                <span class="text-xl leading-tight font-bold text-ink tabular-nums">{d.day}</span>
                <span class="text-small text-muted">{d.month}</span>
            </span>
            <span class="min-w-0 flex-1 space-y-1 self-center">
                <span class="block font-semibold text-ink">{e.title}</span>
                <span class="flex flex-wrap gap-x-4 gap-y-1 text-small text-muted tabular-nums">
                    {#if isMultiDay(e)}
                        <span class="flex items-center gap-1"><Icon name="calendar" size={14} />{formatDateRange(e)}</span>
                    {/if}
                    {#if timeOf(e)}
                        <span class="flex items-center gap-1"><Icon name="clock" size={14} />{timeOf(e)}</span>
                    {/if}
                    {#if e.location}
                        <span class="flex min-w-0 items-center gap-1"
                            ><Icon name="map-pin" size={14} /><span class="truncate">{e.location}</span></span
                        >
                    {/if}
                    {#if e.galleries.length}
                        <span class="flex items-center gap-1 text-link"><Icon name="images" size={14} />Bilder</span>
                    {/if}
                </span>
                {#if e.groups.length || e.tags.length}
                    <span class="flex flex-wrap gap-1.5 pt-0.5">
                        {#each e.groups as g (g.id)}<Chip label={g.name} color={g.color} />{/each}
                        {#each e.tags as t (t)}<Chip label={t} />{/each}
                    </span>
                {/if}
            </span>
        </a>
    </li>
{/snippet}

{#snippet card(e: SiteEvent)}
    {@const color = eventColor(e)}
    <li>
        <a
            href={`/termine/${e.key}`}
            class="group flex h-full flex-col border border-line bg-surface transition-colors hover:border-muted"
        >
            <span class="h-1.5 {color ? '' : 'bg-brand'}" style={color ? `background-color: ${color}` : ''}></span>
            <span class="flex flex-1 flex-col gap-2 p-4">
                <span class="text-small font-medium text-muted tabular-nums">{formatDateRange(e)}</span>
                <span class="text-lg leading-snug font-semibold text-ink transition-colors group-hover:text-link">{e.title}</span>
                <span class="flex flex-col gap-1 text-small text-muted tabular-nums">
                    {#if timeOf(e)}<span class="flex items-center gap-1.5"><Icon name="clock" size={14} />{timeOf(e)}</span>{/if}
                    {#if e.location}
                        <span class="flex min-w-0 items-center gap-1.5"
                            ><Icon name="map-pin" size={14} /><span class="truncate">{e.location}</span></span
                        >
                    {/if}
                </span>
                {#if e.description}
                    <span class="line-clamp-3 text-base text-body">{e.description}</span>
                {/if}
                <span class="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
                    {#each e.groups as g (g.id)}<Chip label={g.name} color={g.color} />{/each}
                    {#each e.tags as t (t)}<Chip label={t} />{/each}
                    {#if e.galleries.length}
                        <span class="ml-auto flex items-center gap-1 text-small text-link"
                            ><Icon name="images" size={14} />Bilder</span
                        >
                    {/if}
                </span>
            </span>
        </a>
    </li>
{/snippet}

<section class="site-container space-y-6 py-12">
    <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
            <h1 class="text-display text-ink">Termine</h1>
            <p class="mt-3 text-lede text-body">Gruppenstunden, Fahrten und Aktionen auf einen Blick.</p>
        </div>
        <div class="inline-flex border border-line-strong bg-surface" role="group" aria-label="Ansicht">
            {#each VIEWS as v (v.id)}
                <button
                    type="button"
                    class="inline-flex h-10 items-center gap-2 px-3 text-small transition-colors {view === v.id
                        ? 'bg-ink text-page'
                        : 'text-body hover:bg-subtle'}"
                    aria-pressed={view === v.id}
                    on:click={() => setView(v.id)}
                >
                    <Icon name={v.icon} />
                    <span class="hidden sm:inline">{v.label}</span>
                    <span class="sr-only sm:hidden">{v.label}</span>
                </button>
            {/each}
        </div>
    </header>

    <!-- Filter -->
    <div class="space-y-3 border-y border-line py-4">
        <div class="relative max-w-md">
            <span class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted">
                <Icon name="search" />
            </span>
            <input
                type="search"
                bind:value={q}
                name="q"
                autocomplete="off"
                placeholder="Termin oder Ort suchen …"
                aria-label="Termine durchsuchen"
                class="field h-10"
                style="padding-left: 2.25rem"
            />
        </div>
        {#if groups.length}
            <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Gruppen">
                <span class="mr-1 text-small text-muted">Gruppen</span>
                {#each groups as g (g.id)}
                    {@const on = selectedGroups.includes(g.id)}
                    <button
                        type="button"
                        class="inline-flex items-center gap-1.5 border px-3 py-1 text-small transition-colors {on
                            ? 'border-ink bg-ink text-page'
                            : 'border-line-strong bg-surface text-body hover:border-muted'}"
                        aria-pressed={on}
                        on:click={() => ((selectedGroups = toggle(selectedGroups, g.id)), (visibleCount = PAGE_SIZE))}
                    >
                        <span
                            class="size-2.5 rounded-full {g.color ? '' : 'bg-muted'}"
                            style={g.color ? `background-color: ${g.color}` : ''}
                            aria-hidden="true"
                        ></span>
                        {g.name}
                    </button>
                {/each}
            </div>
        {/if}
        {#if tags.length}
            <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Themen">
                <span class="mr-1 text-small text-muted">Themen</span>
                {#each tags as t (t)}
                    {@const on = selectedTags.includes(t)}
                    <button
                        type="button"
                        class="border px-3 py-1 text-small transition-colors {on
                            ? 'border-ink bg-ink text-page'
                            : 'border-line-strong bg-surface text-body hover:border-muted'}"
                        aria-pressed={on}
                        on:click={() => ((selectedTags = toggle(selectedTags, t)), (visibleCount = PAGE_SIZE))}
                    >
                        {t}
                    </button>
                {/each}
            </div>
        {/if}
        {#if filterActive}
            <div class="flex items-center gap-3 text-small text-muted" role="status">
                <span>{filtered.length} {filtered.length === 1 ? 'Termin' : 'Termine'} gefunden</span>
                <button type="button" class="text-link" on:click={resetFilters}>
                    Filter zurücksetzen
                </button>
            </div>
        {/if}
    </div>

    {#if view === 'kalender'}
        <MonthCalendar items={calendarItems} {month} today={data.today} on:month={(e) => (month = e.detail)} />
    {:else}
        <!-- Regelmäßige Termine (Serien einmal zusammengefasst) -->
        {#if series.length}
            <section aria-labelledby="regelmaessig" class="space-y-3">
                <h2 id="regelmaessig" class="flex items-center gap-2 text-section text-ink">
                    <Icon name="repeat" size={20} class="text-muted" /> Regelmäßige Termine
                </h2>
                <ul class="grid gap-3 md:grid-cols-2">
                    {#each series as s (s.id)}
                        <li>
                            <a
                                href={`/termine/${s.next.key}`}
                                class="flex h-full gap-3 border border-line bg-surface p-4 transition-colors hover:border-muted"
                            >
                                <span
                                    class="w-1 shrink-0 {s.color ? '' : 'bg-brand'}"
                                    style={s.color ? `background-color: ${s.color}` : ''}
                                    aria-hidden="true"
                                ></span>
                                <span class="min-w-0 flex-1 space-y-1">
                                    <span class="block font-semibold text-ink">{s.title}</span>
                                    <span class="block text-small text-body tabular-nums">
                                        {s.rhythm.charAt(0).toUpperCase() + s.rhythm.slice(1)}{s.time ? `, ${s.time}` : ''}
                                    </span>
                                    {#if s.location}
                                        <span class="flex items-center gap-1 text-small text-muted">
                                            <Icon name="map-pin" size={14} />{s.location}
                                        </span>
                                    {/if}
                                    <span class="block text-small text-muted tabular-nums">Nächstes Treffen: {s.nextLabel}</span>
                                    {#if s.groups.length}
                                        <span class="flex flex-wrap gap-1.5 pt-1">
                                            {#each s.groups as g (g.id)}<Chip label={g.name} color={g.color} />{/each}
                                        </span>
                                    {/if}
                                </span>
                            </a>
                        </li>
                    {/each}
                </ul>
            </section>
        {/if}

        <section aria-labelledby="kommend" class="space-y-3">
            <h2 id="kommend" class="text-section text-ink">
                {series.length ? 'Weitere Termine' : 'Kommende Termine'}
            </h2>
            {#if singles.upcoming.length === 0}
                <p class="border border-dashed border-line-strong p-8 text-center text-muted">
                    {filterActive ? 'Keine kommenden Termine zu diesem Filter.' : 'Gerade stehen keine weiteren Termine an.'}
                </p>
            {:else if view === 'liste'}
                {#each groupByMonth(upcomingShown) as m (m.month)}
                    <div>
                        <h3 class="mb-2 text-sub text-ink">
                            {formatMonth(m.month)}
                        </h3>
                        <ul class="divide-y divide-line border border-line bg-surface">
                            {#each m.events as e (e.key)}
                                {@render row(e)}
                            {/each}
                        </ul>
                    </div>
                {/each}
            {:else}
                <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {#each upcomingShown as e (e.key)}
                        {@render card(e)}
                    {/each}
                </ul>
            {/if}
            {#if singles.upcoming.length > visibleCount}
                <div class="text-center">
                    <button
                        type="button"
                        class="border border-line-strong bg-surface px-4 py-2 text-ink transition-colors hover:bg-subtle"
                        on:click={() => (visibleCount += PAGE_SIZE)}
                    >
                        Weitere Termine laden ({singles.upcoming.length - visibleCount})
                    </button>
                </div>
            {/if}
        </section>

        {#if singles.past.length}
            <section aria-labelledby="vergangen" class="space-y-3 pt-2">
                <button
                    type="button"
                    class="text-link"
                    aria-expanded={showPast}
                    on:click={() => (showPast = !showPast)}
                >
                    {showPast ? 'Vergangene Termine ausblenden' : `Vergangene Termine anzeigen (${singles.past.length})`}
                </button>
                {#if showPast}
                    <h2 id="vergangen" class="text-section text-ink">Vergangene Termine</h2>
                    {#each groupByMonth(singles.past) as m (m.month)}
                        <div class="opacity-80">
                            <h3 class="mb-2 text-sub text-ink">
                                {formatMonth(m.month)}
                            </h3>
                            <ul class="divide-y divide-line border border-line bg-surface">
                                {#each m.events as e (e.key)}
                                    {@render row(e)}
                                {/each}
                            </ul>
                        </div>
                    {/each}
                {:else}
                    <h2 id="vergangen" class="sr-only">Vergangene Termine</h2>
                {/if}
            </section>
        {/if}
    {/if}
</section>
