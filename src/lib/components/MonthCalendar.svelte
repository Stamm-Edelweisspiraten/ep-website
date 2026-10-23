<script lang="ts">
    // Monatskalender der Terminseite (Aufbau wie im Intern-Bereich): Raster Mo–So ab 640 px mit durchgehenden
    // Balken für mehrtägige Termine, „+n weitere“ klappt den Tag auf; darunter Agenda-Liste des Monats.
    // Jeder Termin ist ein Link auf seine Seite.
    import { createEventDispatcher, onMount } from 'svelte';
    import Icon from './Icon.svelte';
    import {
        MAX_LANES,
        WEEKDAY_LABELS,
        buildAgenda,
        buildMonthGrid,
        calendarItemKey,
        contrastTextColor,
        describeItem,
        formatDayLabel,
        formatItemTime,
        formatLongDate,
        formatMonthLabel,
        formatShortDate,
        itemRange,
        itemsOnDay,
        layoutWeek,
        monthOf,
        shiftMonth,
        type CalendarItem,
        type WeekSegment
    } from '$lib/month-calendar';

    type Item = CalendarItem & { href: string };

    export let items: Item[] = [];
    /** `YYYY-MM` */
    export let month: string;
    /** `YYYY-MM-DD` */
    export let today: string;

    const dispatch = createEventDispatcher<{ month: string }>();

    // Zeilenhöhen der Balken (rem): Kopf 1.75, Spur 1.5
    const HEAD = 1.75;
    const LANE = 1.5;

    let openDay: string | null = null;

    $: label = formatMonthLabel(month);
    $: weeks = buildMonthGrid(month).map((days) => layoutWeek(days, items));
    $: agenda = buildAgenda(month, items) as { date: string; items: Item[] }[];

    function go(delta: number) {
        openDay = null;
        dispatch('month', shiftMonth(month, delta));
    }

    function goToday() {
        openDay = null;
        dispatch('month', monthOf(today));
    }

    function barStyle(seg: WeekSegment): string {
        const parts = [
            `top: ${HEAD + seg.lane * LANE}rem`,
            `width: calc(${seg.span} * 100% + ${seg.span - 1}px - 6px)`
        ];
        const fg = contrastTextColor(seg.item.color);
        if (fg) parts.push(`background-color: ${seg.item.color}`, `color: ${fg}`);
        return parts.join('; ');
    }

    function dotStyle(item: CalendarItem): string {
        return contrastTextColor(item.color) ? `background-color: ${item.color}` : '';
    }

    function rangeText(item: CalendarItem): string {
        const r = itemRange(item);
        if (!r || r.start === r.end) return '';
        return `${formatShortDate(r.start)}–${formatShortDate(r.end)}`;
    }

    const asItem = (i: CalendarItem) => i as Item;

    onMount(() => {
        const onClick = (e: MouseEvent) => {
            if (openDay && !(e.target as Element).closest('[data-day-popup]')) openDay = null;
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') openDay = null;
        };
        document.addEventListener('click', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('click', onClick);
            document.removeEventListener('keydown', onKey);
        };
    });
</script>

<div class="space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-xl font-semibold text-gray-900" aria-live="polite">{label}</h2>
        <div class="flex items-center gap-1">
            <button
                type="button"
                class="h-9 border border-gray-300 bg-white px-3 text-sm hover:bg-gray-50"
                on:click={goToday}>Heute</button
            >
            <button
                type="button"
                class="inline-flex size-9 items-center justify-center border border-gray-300 bg-white hover:bg-gray-50"
                aria-label="Vorheriger Monat"
                on:click={() => go(-1)}><Icon name="chevron-left" /></button
            >
            <button
                type="button"
                class="inline-flex size-9 items-center justify-center border border-gray-300 bg-white hover:bg-gray-50"
                aria-label="Nächster Monat"
                on:click={() => go(1)}><Icon name="chevron-right" /></button
            >
        </div>
    </div>

    <!-- Raster ab 640 px -->
    <div class="hidden border border-gray-200 bg-white sm:block" role="table" aria-label="Kalender {label}">
        <div class="grid grid-cols-7 border-b border-gray-200 bg-gray-50" role="row">
            {#each WEEKDAY_LABELS as wd (wd)}
                <div class="px-2 py-1.5 text-xs font-medium text-gray-500" role="columnheader">{wd}</div>
            {/each}
        </div>
        {#each weeks as week (week.days[0])}
            <div class="grid grid-cols-7 border-b border-gray-200 last:border-b-0" role="row">
                {#each week.days as date, col (date)}
                    {@const inMonth = monthOf(date) === month}
                    {@const isToday = date === today}
                    {@const hidden = week.hidden[col] ?? 0}
                    <div
                        class="relative min-h-[8rem] border-r border-gray-200 last:border-r-0 {inMonth
                            ? ''
                            : 'bg-gray-50/70'} {isToday ? 'bg-blue-50/60' : ''}"
                        role="cell"
                        aria-label={formatLongDate(date)}
                    >
                        <div class="flex h-7 items-center px-1.5">
                            <span
                                class="inline-flex size-6 items-center justify-center rounded-full text-xs tabular-nums {isToday
                                    ? 'bg-blue-700 font-semibold text-white'
                                    : inMonth
                                      ? 'text-gray-800'
                                      : 'text-gray-400'}"
                                aria-hidden="true">{Number(date.slice(8, 10))}</span
                            >
                            {#if isToday}<span class="sr-only">Heute</span>{/if}
                        </div>
                        {#each week.segments.filter((s) => s.startCol === col) as seg (calendarItemKey(seg.item))}
                            {@const time = seg.continuesBefore ? '' : formatItemTime(seg.item)}
                            <a
                                href={asItem(seg.item).href}
                                class="absolute left-[3px] z-10 flex h-[1.3rem] items-center gap-1 overflow-hidden px-1.5 text-xs leading-none hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-700 {contrastTextColor(
                                    seg.item.color
                                )
                                    ? ''
                                    : 'bg-blue-700 text-white'} {seg.continuesBefore
                                    ? 'rounded-l-none'
                                    : 'rounded-l-sm'} {seg.continuesAfter ? 'rounded-r-none' : 'rounded-r-sm'}"
                                style={barStyle(seg)}
                                aria-label={describeItem(seg.item)}
                                title={describeItem(seg.item)}
                            >
                                {#if time}<span class="shrink-0 tabular-nums opacity-85">{time}</span>{/if}
                                {#if seg.item.recurring}<Icon name="repeat" size={11} class="opacity-80" />{/if}
                                <span class="truncate font-medium">{seg.item.title}</span>
                            </a>
                        {/each}
                        {#if hidden > 0}
                            <div
                                class="absolute left-[3px] z-20"
                                style="top: {HEAD + MAX_LANES * LANE}rem"
                                data-day-popup
                            >
                                <button
                                    type="button"
                                    class="h-5 px-1.5 text-xs text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    aria-expanded={openDay === date}
                                    aria-label="{hidden} weitere Termine am {formatLongDate(date)}"
                                    on:click={() => (openDay = openDay === date ? null : date)}
                                >
                                    +{hidden} weitere
                                </button>
                                {#if openDay === date}
                                    <div
                                        class="absolute top-6 left-0 w-64 border border-gray-200 bg-white p-2 shadow-lg {col >= 5
                                            ? '-translate-x-[calc(100%-6rem)]'
                                            : ''}"
                                    >
                                        <p class="mb-1 px-1 text-xs font-semibold text-gray-700">
                                            {formatDayLabel(date)}
                                        </p>
                                        <ul class="space-y-0.5">
                                            {#each itemsOnDay(items, date) as item (calendarItemKey(item))}
                                                <li>
                                                    <a
                                                        href={asItem(item).href}
                                                        class="flex items-center gap-2 px-1.5 py-1 text-sm hover:bg-gray-50"
                                                        aria-label={describeItem(item)}
                                                    >
                                                        <span
                                                            class="size-2.5 shrink-0 rounded-full bg-blue-700"
                                                            style={dotStyle(item)}
                                                            aria-hidden="true"
                                                        ></span>
                                                        {#if formatItemTime(item)}
                                                            <span class="shrink-0 text-xs text-gray-500 tabular-nums"
                                                                >{formatItemTime(item)}</span
                                                            >
                                                        {/if}
                                                        <span class="truncate">{item.title}</span>
                                                    </a>
                                                </li>
                                            {/each}
                                        </ul>
                                    </div>
                                {/if}
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        {/each}
    </div>

    <!-- Agenda unter 640 px -->
    <div class="sm:hidden">
        {#if agenda.length === 0}
            <p class="border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                Keine Termine in diesem Monat.
            </p>
        {:else}
            <ul class="space-y-3" aria-label="Termine {label}">
                {#each agenda as day (day.date)}
                    {@const isToday = day.date === today}
                    <li class="border border-gray-200 bg-white">
                        <h3 class="border-b border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-800">
                            {formatDayLabel(day.date)}
                            {#if isToday}
                                <span class="ml-1 rounded-full bg-blue-700 px-1.5 py-0.5 text-[0.7rem] font-medium text-white"
                                    >Heute</span
                                >
                            {/if}
                        </h3>
                        <ul class="divide-y divide-gray-100">
                            {#each day.items as item (calendarItemKey(item))}
                                <li>
                                    <a
                                        href={item.href}
                                        class="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50"
                                        aria-label={describeItem(item)}
                                    >
                                        <span
                                            class="h-8 w-1 shrink-0 rounded-full bg-blue-700"
                                            style={dotStyle(item)}
                                            aria-hidden="true"
                                        ></span>
                                        <span class="min-w-0 flex-1">
                                            <span class="flex min-w-0 items-center gap-1.5 font-medium text-gray-900">
                                                {#if item.recurring}<Icon name="repeat" size={13} class="text-gray-400" />{/if}
                                                <span class="truncate">{item.title}</span>
                                            </span>
                                            {#if formatItemTime(item) || rangeText(item)}
                                                <span class="block text-xs text-gray-500 tabular-nums">
                                                    {[rangeText(item), formatItemTime(item)].filter(Boolean).join(' · ')}
                                                </span>
                                            {/if}
                                        </span>
                                    </a>
                                </li>
                            {/each}
                        </ul>
                    </li>
                {/each}
            </ul>
        {/if}
    </div>
</div>
