<script lang="ts">
    // Terminliste (Startseite, Gruppenseite, Termine): Datumsblock links, Titel mit Uhrzeit/Ort, Gruppen rechts.
    import { dayParts, formatDateRange, formatTimeRange, isMultiDay } from '$lib/dates';
    import type { SiteEvent } from '$lib/site-types';
    import Icon from '$lib/components/Icon.svelte';

    export let events: SiteEvent[] | null;
    /** Text, wenn nichts ansteht */
    export let emptyText = 'Gerade stehen keine weiteren Termine an.';
    /** Gruppen anzeigen (auf der Gruppenseite überflüssig) */
    export let showGroups = true;

    function when(e: SiteEvent) {
        const t = formatTimeRange(e.startsTime, e.endsTime, isMultiDay(e));
        return isMultiDay(e) ? [formatDateRange(e), t].filter(Boolean).join(' · ') : t;
    }
    const mo = (d: string) => dayParts(d).month.replace('.', '');
</script>

{#if events === null}
    <p class="empty">Die Termine konnten gerade nicht geladen werden. Alle Termine findest du im <a href="/termine" class="text-link">Kalender</a>.</p>
{:else if events.length === 0}
    <p class="empty">{emptyText}</p>
{:else}
    <ul class="tlist">
        {#each events as e (e.key)}
            {@const d = dayParts(e.startsOn)}
            <li>
                <a class="tl" href="/termine/{encodeURIComponent(e.key)}">
                    <span class="dbox"><span class="wd">{d.weekday}</span><span class="dn">{d.day}</span><span class="mo">{mo(e.startsOn)}</span></span>
                    <span style="min-width: 0">
                        <span class="t">{e.title}</span>
                        {#if when(e) || e.location}
                            <span class="cap meta">
                                {#if when(e)}<span><Icon name="clock" size={16} />{when(e)}</span>{/if}
                                {#if e.location}<span><Icon name="map-pin" size={16} />{e.location}</span>{/if}
                            </span>
                        {/if}
                    </span>
                    <span class="tags">
                        {#if showGroups}
                            {#each e.groups as g (g.id)}<span class="tag on-cloud"><span class="dot" style="--g: {g.color ?? 'currentColor'}"></span><span>{g.name}</span></span>{/each}
                        {/if}
                    </span>
                    <Icon name="chevron-right" class="arrow" />
                </a>
            </li>
        {/each}
    </ul>
{/if}
