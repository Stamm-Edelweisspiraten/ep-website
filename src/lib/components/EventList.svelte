<script lang="ts">
    // Schlichte Terminliste (Startseite, Gruppenseite): Datum links, Titel mit Uhrzeit/Ort/Gruppen rechts.
    import { formatDateRange, formatTimeRange, isMultiDay } from '$lib/dates';
    import type { SiteEvent } from '$lib/site-types';

    export let events: SiteEvent[] | null;
    /** Text, wenn nichts ansteht */
    export let emptyText = 'Gerade stehen keine weiteren Termine an.';
    /** Gruppen anzeigen (auf der Gruppenseite überflüssig) */
    export let showGroups = true;

    function meta(e: SiteEvent) {
        const parts = [
            formatTimeRange(e.startsTime, e.endsTime, isMultiDay(e)),
            e.location ?? ''
        ];
        if (showGroups) parts.push(e.groups.length ? e.groups.map((g) => g.name).join(', ') : '');
        return parts.filter(Boolean).join(' · ');
    }
</script>

{#if events === null}
    <p class="border-t border-line py-3 text-muted">Die Termine konnten gerade nicht geladen werden. Alle Termine findest du im <a href="/termine" class="text-link">Kalender</a>.</p>
{:else if events.length === 0}
    <p class="border-t border-line py-3 text-muted">{emptyText}</p>
{:else}
    <ul>
        {#each events as e (e.key)}
            <li class="grid gap-x-6 border-t border-line py-3 sm:grid-cols-[10rem_minmax(0,1fr)]">
                <span class="font-semibold text-ink tabular-nums">{formatDateRange(e)}</span>
                <span>
                    <a href="/termine/{encodeURIComponent(e.key)}" class="font-semibold text-ink transition-colors hover:text-link hover:underline">{e.title}</a>
                    {#if meta(e)}<br /><span class="text-small text-muted tabular-nums">{meta(e)}</span>{/if}
                </span>
            </li>
        {/each}
    </ul>
{/if}
