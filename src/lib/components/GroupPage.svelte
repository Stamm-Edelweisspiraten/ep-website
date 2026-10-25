<script>
    // Gruppenseite; Inhalte kommen aus dem Intern-Bereich (Gruppendialog → Allgemein + Reiter Website).
    // Die Gruppenfarbe färbt nur den Namen.
    import Map from '$lib/components/Map.svelte';
    import EmailButtons from '$lib/components/EmailButtons.svelte';
    import EventList from '$lib/components/EventList.svelte';

    /** @type {import('$lib/server/backend').Group} */
    export let group;
    /** @type {import('$lib/site-types').SiteEvent[] | null} */
    export let events = null;

    $: when = [group.weekday, group.time].filter(Boolean).join(', ');
    $: facts = [
        { label: 'Gruppenstunde', value: when },
        { label: 'Ort', value: group.meetingPlace },
        { label: 'Alter', value: group.ageRange },
        { label: 'Gruppenleitung', value: group.leaders }
    ].filter((f) => f.value);
</script>

<svelte:head>
    <title>{group.name} – Stamm Edelweißpiraten</title>
    <meta
            name="description"
            content={`${group.typeLabel} der Edelweißpiraten${group.ageRange ? ` (${group.ageRange})` : ''} in Bremen-Hastedt: ${group.teaser}`}
    />
</svelte:head>

<div class="site-container pt-12">
    <header class="grid items-center gap-4 border-b border-line pb-8 {group.image ? 'grid-cols-[96px_minmax(0,1fr)] sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-9' : ''}">
        {#if group.image}
            <img src={group.image} alt="Gruppenbild {group.name}" width="180" height="180" class="h-auto w-full" />
        {/if}
        <div>
            <p class="text-muted">{group.typeLabel}</p>
            <h1 class="group-name text-display" style="--g: {group.color}">{group.name}</h1>
            {#if group.teaser}<p class="mt-3 text-lede text-body">{group.teaser}</p>{/if}
        </div>
    </header>

    {#if facts.length || group.contactEmail}
        <dl class="grid gap-x-4 gap-y-2 pt-8 sm:grid-cols-[10rem_minmax(0,1fr)]">
            {#each facts as f (f.label)}
                <dt class="text-muted">{f.label}</dt>
                <dd class="text-ink tabular-nums">{f.value}</dd>
            {/each}
            {#if group.contactEmail}
                <dt class="text-muted">Kontakt</dt>
                <dd><a href="mailto:{group.contactEmail}" class="text-link">{group.contactEmail}</a></dd>
            {/if}
        </dl>
    {/if}

    {#if group.description}
        <section class="section-gap">
            <h2 class="mb-3 text-section text-ink">Das sind wir</h2>
            <p class="max-w-3xl text-base leading-relaxed whitespace-pre-line text-body">{group.description}</p>
        </section>
    {/if}

    <section class="section-gap">
        <h2 class="mb-3 text-section text-ink">Nächste Termine</h2>
        <EventList {events} showGroups={false} emptyText="Gerade stehen keine besonderen Termine an – die Gruppenstunde findet wie gewohnt statt." />
        <p class="border-t border-line pt-3">
            <a href="/termine?gruppe={encodeURIComponent(group.name)}" class="text-link">Alle Termine der {group.typeLabel}</a>
        </p>
    </section>

    <section class="section-gap">
        <h2 class="mb-3 text-section text-ink">Kontakt</h2>
        {#if group.contactEmail}
            <p>Bei Fragen schreib der Gruppenleitung: <span class="text-ink">{group.contactEmail}</span></p>
            <EmailButtons email={group.contactEmail} />
        {:else}
            <p>Schreib uns gern über das <a href="/kontakt" class="text-link">Kontaktformular</a>.</p>
        {/if}
    </section>

    <section class="section-gap">
        <h2 class="mb-3 text-section text-ink">Treffpunkt</h2>
        <Map height="h-[320px]" />
    </section>
</div>
