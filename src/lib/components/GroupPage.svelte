<script>
    // Gruppenseite; Inhalte kommen aus dem Intern-Bereich (Gruppendialog → Allgemein + Reiter Website).
    import { page } from '$app/stores';
    import Map from '$lib/components/Map.svelte';
    import EmailButtons from '$lib/components/EmailButtons.svelte';
    import EventList from '$lib/components/EventList.svelte';
    import CalendarSubscribe from '$lib/components/CalendarSubscribe.svelte';
    import Icon from '$lib/components/Icon.svelte';
    import Seo from '$lib/components/Seo.svelte';
    import { formatMonth } from '$lib/dates';

    /** @type {import('$lib/server/backend').Group} */
    export let group;
    /** @type {import('$lib/site-types').SiteEvent[] | null} */
    export let events = null;
    /** @type {import('$lib/site-types').SiteGallery[]} */
    export let galleries = [];

    $: when = [group.weekday, group.time].filter(Boolean).join(' ');
    $: facts = [
        { label: 'Gruppenstunde', value: when, icon: /** @type {const} */ ('clock') },
        { label: 'Alter', value: group.ageRange, icon: /** @type {const} */ ('users') },
        { label: 'Treffpunkt', value: group.meetingPlace, icon: /** @type {const} */ ('map-pin') },
        { label: 'Gruppenleitung', value: group.leaders, icon: /** @type {const} */ ('shield') }
    ].filter((f) => f.value);
    /** @type {import('$lib/server/backend').Group[]} */
    $: others = ($page.data.groups ?? []).filter((/** @type {import('$lib/server/backend').Group} */ g) => g.slug !== group.slug);
</script>

<Seo
    title={`${group.name} – ${group.typeLabel} der Pfadfinder in Bremen-Hastedt`}
    description={`${group.typeLabel} der Pfadfinder Edelweißpiraten${group.ageRange ? ` (${group.ageRange})` : ''} in Bremen-Hastedt/Hemelingen: ${group.teaser}`}
    path={group.href}
    breadcrumbs={[{ name: `${group.typeLabel} ${group.name}`, path: group.href }]}
/>

<div class="site-container">
    <nav class="crumbs" aria-label="Brotkrümel">
        <a href="/">Start</a><Icon name="chevron-right" size={18} /><a href="/#gruppen">Gruppen</a><Icon name="chevron-right" size={18} /><span aria-current="page">{group.name}</span>
    </nav>
</div>

<section class="site-container ghead" aria-labelledby="h-gruppe">
    <div class="gimg">
        {#if group.image}
            <img
                src={group.image}
                srcset={group.thumb && group.thumb !== group.image ? `${group.thumb} 640w, ${group.image} 1600w` : undefined}
                sizes="(max-width: 50rem) 90vw, 40vw"
                alt="Gruppenbild {group.name}"
                width="500"
                height="500"
            />
        {:else}
            <img src="/logo.avif" alt="" width="676" height="1000" class="seal" />
        {/if}
    </div>
    <div class="gtxt">
        <p class="kick"><span class="tag"><span class="dot" style="--g: {group.color}"></span><span>{group.typeLabel}</span></span>{#if group.ageRange}<span class="cap">{group.ageRange}</span>{/if}</p>
        <h1 class="display" id="h-gruppe">{group.name}</h1>
        {#if group.teaser}<p class="lede">{group.teaser}</p>{/if}
        <div class="acts">
            <a class="pill" href="/probestunde?gruppe={encodeURIComponent(group.slug)}" data-umami-event="Probestunde-Knopf" data-umami-event-ort="Gruppenseite" data-umami-event-gruppe={group.slug}>Probestunde ausmachen<Icon name="arrow-right" size={18} /></a>
            <a class="pill soft" href="/termine?gruppe={encodeURIComponent(group.name)}"><Icon name="calendar" size={18} />Termine der {group.typeLabel}</a>
        </div>
    </div>
</section>

{#if facts.length}
    <section class="site-container" aria-label="Kurzinfo">
        <dl class="facts" style="margin-top: 48px">
            {#each facts as f (f.label)}
                <div class="fact"><dt><span class="ic" aria-hidden="true"><Icon name={f.icon} /></span>{f.label}</dt><dd class="tab">{f.value}</dd></div>
            {/each}
        </dl>
    </section>
{/if}

{#if group.description}
    <section class="site-container section-gap" aria-labelledby="h-wir">
        <div class="split">
            <h2 class="h-xl" id="h-wir">Das sind wir</h2>
            <p class="desc">{group.description}</p>
        </div>
    </section>
{/if}

<section class="site-container section-gap" aria-labelledby="h-termine">
    <div class="rowhead">
        <h2 class="h-xl" id="h-termine">Nächste Termine</h2>
        <a class="ulink" href="/termine?gruppe={encodeURIComponent(group.name)}">Alle Termine der {group.typeLabel}<Icon name="arrow-right" size={18} /></a>
    </div>
    <EventList {events} showGroups={false} emptyText="Gerade stehen keine besonderen Termine an – die Gruppenstunde findet wie gewohnt statt." />
    {#if when}<p class="cap" style="margin-top: 16px">Die Gruppenstunde findet jede Woche statt ({when}).</p>{/if}
    <div class="calrow">
        <p class="cap">Alle Termine und Gruppenstunden der {group.typeLabel} automatisch im eigenen Kalender:</p>
        <CalendarSubscribe groupSlug={group.slug} label="Kalender abonnieren" />
    </div>
</section>

{#if galleries.length}
    <section class="site-container section-gap" aria-labelledby="h-bilder">
        <div class="rowhead">
            <h2 class="h-xl" id="h-bilder">Bilder</h2>
            <a class="ulink" href="/galerie?gruppe={encodeURIComponent(group.name)}">Zur Galerie<Icon name="arrow-right" size={18} /></a>
        </div>
        <div class="grid3">
            {#each galleries as g (g.id)}
                <a class="tile" href="/galerie/{g.id}">
                    <div class="ph">{#if g.cover}<img src={g.cover.url} alt="" width={g.cover.width} height={g.cover.height} loading="lazy" decoding="async" />{/if}</div>
                    <p class="n">{g.title}</p>
                    <p class="cap">{g.imageCount} Bilder · {formatMonth(g.date)}</p>
                </a>
            {/each}
        </div>
    </section>
{/if}

<section class="site-container section-gap" id="kontakt" aria-labelledby="h-kontakt">
    <div class="kontakt">
        <div class="kbox">
            <span class="ic" style="width: 48px; height: 48px"><Icon name="mail" /></span>
            <h2 class="h-xl" id="h-kontakt">Kontakt</h2>
            {#if group.contactEmail}
                <p>Bei Fragen zur Gruppe oder zur Probestunde schreib der Gruppenleitung.</p>
                <p class="addr">{group.contactEmail}</p>
                <EmailButtons email={group.contactEmail} onCloud />
            {:else}
                <p>Schreib uns gern über das Kontaktformular, wir leiten deine Frage an die Gruppenleitung weiter.</p>
                <a class="pill" href="/kontakt">Zum Kontaktformular</a>
            {/if}
        </div>
        <div class="mapcol"><Map height={380} /></div>
    </div>
</section>

{#if others.length}
    <section class="site-container section-gap" aria-labelledby="h-andere">
        <h2 class="h-xl" id="h-andere" style="margin-bottom: 24px">Weitere Gruppen</h2>
        <div class="others">
            {#each others as o (o.slug)}
                <a class="oc" href={o.href}>
                    <span class="im">{#if o.image}<img src={o.thumb ?? o.image} alt="" width="120" height="120" loading="lazy" decoding="async" />{:else}<img src="/logo.avif" alt="" width="676" height="1000" class="seal" loading="lazy" />{/if}</span>
                    <span>
                        <span class="n">{o.name}</span>
                        <span class="cap" style="display: block">{[o.typeLabel, o.ageRange].filter(Boolean).join(' · ')}</span>
                        {#if o.weekday || o.time}<span class="tab" style="display: block; margin-top: 4px">{[o.weekday, o.time].filter(Boolean).join(' ')}</span>{/if}
                    </span>
                    <span class="go"><Icon name="arrow-right" /></span>
                </a>
            {/each}
        </div>
    </section>
{/if}

<style>
    .ghead {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 24px;
        align-items: center;
        padding-top: 24px;
    }
    .gimg {
        grid-column: 1 / span 5;
        background: var(--color-subtle);
        aspect-ratio: 1 / 1;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .gimg img {
        width: 64%;
        height: 64%;
        object-fit: contain;
        display: block;
    }
    .gimg img.seal,
    .im img.seal {
        width: 34%;
    }
    .gtxt {
        grid-column: 7 / span 6;
        display: flex;
        flex-direction: column;
        gap: 22px;
        align-items: flex-start;
    }
    .kick {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .gtxt h1 {
        font-size: clamp(72px, 8.4vw, 128px);
        overflow-wrap: anywhere;
    }
    .lede {
        font-size: 18px;
        color: var(--color-body);
        max-width: 46ch;
    }
    .split {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 24px;
        align-items: start;
    }
    .split h2 {
        grid-column: 1 / span 4;
    }
    .desc {
        grid-column: 6 / span 7;
        font-size: 17px;
        line-height: 1.65;
        color: var(--color-body);
        white-space: pre-line;
        max-width: 68ch;
    }
    .kontakt {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 8px;
    }
    .kbox {
        grid-column: span 5;
        background: var(--color-subtle);
        padding: 32px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
    }
    .kbox p {
        color: var(--color-body);
    }
    .kbox .addr {
        font-size: 18px;
        font-weight: 500;
        color: var(--color-ink);
        overflow-wrap: anywhere;
    }
    .mapcol {
        grid-column: span 7;
    }
    .others {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
    }
    .oc {
        display: grid;
        grid-template-columns: 120px minmax(0, 1fr) 44px;
        gap: 20px;
        align-items: center;
        padding: 16px;
        background: var(--color-subtle);
        text-decoration: none;
        color: var(--color-ink);
        transition: background 0.15s ease;
    }
    .oc:hover {
        background: var(--color-subtle-2);
    }
    .im {
        width: 120px;
        height: 120px;
        background: var(--color-page);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .im img {
        width: 70%;
        height: 70%;
        object-fit: contain;
        display: block;
    }
    .oc .n {
        font-size: 18px;
        font-weight: 500;
    }
    .go {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: var(--color-page);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
    }
    .oc:hover .go {
        transform: translateX(3px);
    }
    @media (max-width: 50rem) {
        .gimg,
        .gtxt,
        .split h2,
        .desc,
        .kbox,
        .mapcol {
            grid-column: 1 / -1;
        }
        .gimg {
            aspect-ratio: 16 / 10;
        }
        .gtxt h1 {
            font-size: clamp(56px, 17vw, 96px);
        }
        .lede {
            font-size: 17px;
        }
        .others {
            grid-template-columns: 1fr;
        }
        .oc {
            grid-template-columns: 88px minmax(0, 1fr) 44px;
            gap: 14px;
        }
        .im {
            width: 88px;
            height: 88px;
        }
    }
    .calrow {
        margin-top: 24px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
</style>
