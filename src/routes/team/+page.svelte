<script lang="ts">
    import Seo from '$lib/components/Seo.svelte';
    // „Unser Team“: Ämter aus dem Intern-Bereich mit den Personen, die der Anzeige im Profil zugestimmt haben.
    // Es erscheinen nur Vornamen (der Nachname kommt gar nicht erst vom Backend).
    import { page } from '$app/stores';
    import EmailButtons from '$lib/components/EmailButtons.svelte';
    import Icon from '$lib/components/Icon.svelte';
    import type { PageData } from './$types';

    export let data: PageData;

    /** Lange Beschreibungen erst gekürzt zeigen */
    const BIO_PREVIEW = 220;
    let expanded = new Set<string>();

    function toggle(key: string) {
        expanded = new Set(expanded.has(key) ? [...expanded].filter((k) => k !== key) : [...expanded, key]);
    }

    function sinceText(since: string | null) {
        if (!since || !/^\d{4}-\d{2}-\d{2}$/.test(since)) return '';
        return `seit ${since.slice(0, 4)}`;
    }

    $: people = data.offices.reduce((sum, o) => sum + o.holders.length, 0);
</script>

<Seo
    title="Unser Team – Stamm Edelweißpiraten"
    description="Wer im Stamm Edelweißpiraten welche Aufgabe übernimmt – Stammesführung, Kasse, Material und mehr. Alle ehrenamtlich."
    path="/team"
    breadcrumbs={[{ name: 'Unser Team', path: '/team' }]}
/>

<section class="site-container" aria-labelledby="h-team">
    <nav class="crumbs" aria-label="Brotkrümel"><a href="/">Start</a><Icon name="chevron-right" size={18} /><span aria-current="page">Unser Team</span></nav>
    <div class="phead">
        <h1 class="display" id="h-team">Unser Team</h1>
        <div class="side">
            <p>Hinter dem Stamm stehen viele Ehrenamtliche. Hier siehst du, wer sich um welche Aufgabe kümmert und wen du bei Fragen ansprechen kannst.</p>
        </div>
    </div>
    {#if data.offices.length > 1}
        <nav class="chips scroll jump" aria-label="Ämter">
            {#each data.offices as office (office.id)}<a class="chip" href="#amt-{office.id}">{office.name}</a>{/each}
        </nav>
    {/if}
</section>

<div class="site-container" style="margin-top: 24px">
    {#if data.offices.length === 0}
        <p class="empty" style="margin-top: 24px">Hier stellen wir bald unser Team vor.</p>
    {:else}
        {#each data.offices as office (office.id)}
            <section class="office" id="amt-{office.id}" aria-labelledby="h-amt-{office.id}">
                <div class="info">
                    <h2 class="h-xl" id="h-amt-{office.id}">{office.name}</h2>
                    {#if office.description}<p class="od">{office.description}</p>{/if}
                    {#each office.emails as mail (mail.email)}
                        <div class="mail">
                            <p class="cap">{mail.label || 'E-Mail'}</p>
                            <p class="addr">{mail.email}</p>
                            <EmailButtons email={mail.email} />
                        </div>
                    {/each}
                </div>
                {#if office.holders.length}
                    <ul class="people">
                        {#each office.holders as person (person.id)}
                            {@const key = `${office.id}:${person.id}`}
                            {@const long = (person.bio?.length ?? 0) > BIO_PREVIEW}
                            <li class="person">
                                <div class="who">
                                    {#if person.imageUrl}
                                        <img src={person.imageUrl} alt="Profilbild von {person.firstName}" width="72" height="72" loading="lazy" decoding="async" class="av" />
                                    {:else}
                                        <span class="av" aria-hidden="true">{person.firstName.charAt(0).toUpperCase()}</span>
                                    {/if}
                                    <div>
                                        <p class="n">{person.firstName}</p>
                                        {#if sinceText(person.since)}<p class="cap">{sinceText(person.since)}</p>{/if}
                                    </div>
                                </div>
                                {#if person.bio}
                                    <p class="bio">
                                        {long && !expanded.has(key) ? `${person.bio.slice(0, BIO_PREVIEW).trimEnd()} …` : person.bio}
                                    </p>
                                    {#if long}
                                        <button type="button" class="more" aria-expanded={expanded.has(key)} data-umami-event="Team: Mehr lesen" on:click={() => toggle(key)}>
                                            {expanded.has(key) ? 'Weniger anzeigen' : 'Mehr lesen'}
                                        </button>
                                    {/if}
                                {/if}
                            </li>
                        {/each}
                    </ul>
                {:else}
                    <p class="solo">Bei Fragen schreib einfach an die Adresse links.</p>
                {/if}
            </section>
        {/each}
        {#if people === 0}
            <p class="empty" style="margin-top: 24px">Die Personen hinter den Ämtern stellen sich hier vor, sobald sie zugestimmt haben.</p>
        {/if}
    {/if}
</div>

<section class="site-container section-gap" aria-labelledby="h-leitung">
    <div class="leaders">
        <div class="t">
            <h2 class="h-xl" id="h-leitung">Fragen zu einer Gruppe?</h2>
            <p>Die beantworten die Gruppenleitungen. Ihre Adressen stehen auf den Gruppenseiten und unter Kontakt.</p>
            <p><a class="ulink" href="/kontakt">Zum Kontakt<Icon name="arrow-right" size={18} /></a></p>
        </div>
        {#if $page.data.groups?.length}
            <div class="g">
                {#each $page.data.groups as g (g.slug)}
                    <a href={g.href}><span class="wn"><span class="dot" style="--g: {g.color}"></span>{g.name}</span><Icon name="chevron-right" /></a>
                {/each}
            </div>
        {/if}
    </div>
</section>

<style>
    .jump {
        margin-top: 48px;
    }
    .office {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 24px;
        align-items: start;
        padding-block: 48px;
        border-top: 8px solid var(--color-subtle);
    }
    .info {
        grid-column: 1 / span 4;
        display: flex;
        flex-direction: column;
        gap: 14px;
        align-items: flex-start;
    }
    .od {
        color: var(--color-body);
        white-space: pre-line;
    }
    .mail {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 6px;
    }
    .addr {
        font-weight: 500;
        overflow-wrap: anywhere;
    }
    .people {
        grid-column: 6 / span 7;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
    }
    .person {
        background: var(--color-subtle);
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 14px;
    }
    .who {
        display: flex;
        align-items: center;
        gap: 16px;
    }
    .av {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: var(--color-page);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;
        font-weight: 600;
        flex: none;
        object-fit: cover;
    }
    .n {
        font-size: 20px;
        font-weight: 500;
        line-height: 1.2;
    }
    .bio {
        color: var(--color-body);
        white-space: pre-line;
    }
    .more {
        align-self: flex-start;
        border: 0;
        background: none;
        padding: 0;
        font: 500 15px var(--font-sans);
        color: var(--color-ink);
        text-decoration: underline;
        text-underline-offset: 4px;
        cursor: pointer;
        min-height: 44px;
    }
    .solo {
        grid-column: 6 / span 7;
        background: var(--color-subtle);
        padding: 24px;
        color: var(--color-body);
    }
    .leaders {
        background: var(--color-subtle);
        padding: 40px;
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 24px;
        align-items: center;
    }
    .leaders .t {
        grid-column: 1 / span 6;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .leaders .t p {
        color: var(--color-body);
    }
    .leaders .g {
        grid-column: 8 / span 5;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .leaders .g a {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        background: var(--color-page);
        padding: 14px 18px;
        text-decoration: none;
        font-weight: 500;
        color: var(--color-ink);
        transition: background 0.15s ease;
    }
    .leaders .g a:hover {
        background: var(--color-subtle-2);
    }
    .wn {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    @media (max-width: 50rem) {
        .jump {
            margin-top: 32px;
        }
        .office {
            padding-block: 36px;
        }
        .info,
        .people,
        .solo,
        .leaders .t,
        .leaders .g {
            grid-column: 1 / -1;
        }
        .people {
            grid-template-columns: 1fr;
        }
        .leaders {
            padding: 24px;
        }
    }
</style>
