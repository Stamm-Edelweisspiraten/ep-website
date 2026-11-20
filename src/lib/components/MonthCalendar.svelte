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
        if (contrastTextColor(seg.item.color)) parts.push(`--g: ${seg.item.color}`);
        return parts.join('; ');
    }

    function dotStyle(item: CalendarItem): string {
        return contrastTextColor(item.color) ? `--g: ${item.color}` : '';
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

<div class="mc">
    <div class="calhead">
        <h2 class="h-xl" aria-live="polite">{label}</h2>
        <div class="acts">
            <button type="button" class="pill soft sm" data-umami-event="Kalender geblättert" data-umami-event-richtung="heute" on:click={goToday}>Heute</button>
            <button type="button" class="round" aria-label="Vorheriger Monat" data-umami-event="Kalender geblättert" data-umami-event-richtung="zurück" on:click={() => go(-1)}><Icon name="chevron-left" /></button>
            <button type="button" class="round" aria-label="Nächster Monat" data-umami-event="Kalender geblättert" data-umami-event-richtung="vor" on:click={() => go(1)}><Icon name="chevron-right" /></button>
        </div>
    </div>

    <!-- Raster ab 640 px -->
    <div class="grid-wrap" role="table" aria-label="Kalender {label}">
        <div class="wrow" role="row">
            {#each WEEKDAY_LABELS as wd (wd)}
                <div class="wh" role="columnheader">{wd}</div>
            {/each}
        </div>
        {#each weeks as week (week.days[0])}
            <div class="wrow" role="row">
                {#each week.days as date, col (date)}
                    {@const inMonth = monthOf(date) === month}
                    {@const isToday = date === today}
                    {@const hidden = week.hidden[col] ?? 0}
                    <div class="cell {inMonth ? '' : 'out'}" role="cell" aria-label={formatLongDate(date)}>
                        <div class="num-row">
                            <span class="num {isToday ? 'today' : ''}" aria-hidden="true">{Number(date.slice(8, 10))}</span>
                            {#if isToday}<span class="sr-only">Heute</span>{/if}
                        </div>
                        {#each week.segments.filter((s) => s.startCol === col) as seg (calendarItemKey(seg.item))}
                            <a
                                href={asItem(seg.item).href}
                                class="ev {contrastTextColor(seg.item.color) ? 'colored' : ''}"
                                style={barStyle(seg)}
                                aria-label={describeItem(seg.item)}
                                title={describeItem(seg.item)}
                            >
                                {#if seg.item.recurring}<Icon name="repeat" size={12} />{/if}
                                <span class="tt">{seg.item.title}</span>
                            </a>
                        {/each}
                        {#if hidden > 0}
                            <div class="more" style="top: {HEAD + MAX_LANES * LANE}rem" data-day-popup>
                                <button
                                    type="button"
                                    aria-expanded={openDay === date}
                                    aria-label="{hidden} weitere Termine am {formatLongDate(date)}"
                                    on:click={() => (openDay = openDay === date ? null : date)}
                                >
                                    +{hidden} weitere
                                </button>
                                {#if openDay === date}
                                    <div class="pop {col >= 5 ? 'left' : ''}">
                                        <p class="pt">{formatDayLabel(date)}</p>
                                        <ul>
                                            {#each itemsOnDay(items, date) as item (calendarItemKey(item))}
                                                <li>
                                                    <a href={asItem(item).href} aria-label={describeItem(item)}>
                                                        <span class="cdot" style={dotStyle(item)}></span>
                                                        {#if formatItemTime(item)}<span class="cap tab">{formatItemTime(item)}</span>{/if}
                                                        <span class="tt">{item.title}</span>
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
    <div class="agenda">
        {#if agenda.length === 0}
            <p class="empty">Keine Termine in diesem Monat.</p>
        {:else}
            <ul class="days" aria-label="Termine {label}">
                {#each agenda as day (day.date)}
                    {@const isToday = day.date === today}
                    <li class="aday">
                        <h3>
                            {formatDayLabel(day.date)}
                            {#if isToday}<span class="tag on-cloud today-tag">Heute</span>{/if}
                        </h3>
                        <ul>
                            {#each day.items as item (calendarItemKey(item))}
                                <li>
                                    <a href={item.href} aria-label={describeItem(item)}>
                                        <span class="cdot" style={dotStyle(item)}></span>
                                        <span class="body">
                                            <span class="name">
                                                {#if item.recurring}<Icon name="repeat" size={14} />{/if}<span class="tt">{item.title}</span>
                                            </span>
                                            {#if formatItemTime(item) || rangeText(item)}
                                                <span class="cap tab" style="display: block">{[rangeText(item), formatItemTime(item)].filter(Boolean).join(' · ')}</span>
                                            {/if}
                                        </span>
                                        <Icon name="chevron-right" size={18} />
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

<style>
    .calhead {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 16px;
    }
    .grid-wrap {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    .wrow {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 4px;
    }
    .wh {
        font-size: 13px;
        color: var(--color-muted);
        padding: 0 8px 2px;
    }
    .cell {
        position: relative;
        min-height: 8rem;
        background: var(--color-subtle);
        min-width: 0;
    }
    .cell.out {
        background: transparent;
        color: var(--color-muted);
    }
    .num-row {
        display: flex;
        height: 1.75rem;
        align-items: center;
        padding: 0 6px;
    }
    .num {
        display: inline-flex;
        width: 24px;
        height: 24px;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-size: 13px;
        font-weight: 500;
        font-variant-numeric: tabular-nums;
    }
    .num.today {
        background: var(--color-ink);
        color: var(--color-on-ink);
    }
    .ev {
        position: absolute;
        left: 3px;
        z-index: 10;
        display: flex;
        height: 1.3rem;
        align-items: center;
        gap: 4px;
        overflow: hidden;
        padding: 0 6px;
        font-size: 13px;
        line-height: 1;
        background: var(--color-page);
        color: var(--color-ink);
        text-decoration: none;
        transition: background 0.15s ease;
    }
    .ev.colored {
        border-left: 3px solid var(--g);
    }
    .ev:hover {
        background: var(--color-ink);
        color: var(--color-on-ink);
    }
    .tt {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 500;
    }
    .more {
        position: absolute;
        left: 3px;
        z-index: 20;
    }
    .more > button {
        height: 20px;
        padding: 0 6px;
        border: 0;
        background: none;
        font-size: 13px;
        color: var(--color-muted);
        cursor: pointer;
    }
    .more > button:hover {
        color: var(--color-ink);
        text-decoration: underline;
    }
    .pop {
        position: absolute;
        top: 24px;
        left: 0;
        width: 16rem;
        background: var(--color-page);
        outline: 1px solid var(--color-line-strong);
        padding: 8px;
    }
    .pop.left {
        transform: translateX(calc(-100% + 6rem));
    }
    .pt {
        padding: 2px 6px 6px;
        font-size: 13px;
        font-weight: 600;
    }
    .pop a {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px;
        font-size: 15px;
        text-decoration: none;
        color: var(--color-ink);
    }
    .pop a:hover {
        background: var(--color-subtle);
    }
    .cdot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex: none;
        background: var(--g, var(--color-ink));
    }
    .agenda {
        display: none;
    }
    .days {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .aday {
        background: var(--color-subtle);
        padding: 12px;
    }
    .aday h3 {
        font-size: 15px;
        font-weight: 600;
        padding: 2px 4px 8px;
        display: flex;
        align-items: center;
    }
    .today-tag {
        height: 24px;
        margin-left: 6px;
    }
    .aday ul {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    .aday a {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        background: var(--color-page);
        text-decoration: none;
        color: var(--color-ink);
        min-height: 48px;
    }
    .body {
        min-width: 0;
        flex: 1;
    }
    .name {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
    }
    @media (max-width: 40rem) {
        .grid-wrap {
            display: none;
        }
        .agenda {
            display: block;
        }
    }
</style>
