<script lang="ts">
    // „Unser Team“: Ämter aus dem Intern-Bereich mit den Personen, die der Anzeige im Profil zugestimmt haben.
    // Es erscheinen nur Vornamen (der Nachname kommt gar nicht erst vom Backend).
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

<svelte:head>
    <title>Unser Team – Stamm Edelweißpiraten</title>
    <meta
        name="description"
        content="Wer im Stamm Edelweißpiraten welche Aufgabe übernimmt – Stammesführung, Kasse, Material und mehr. Alle ehrenamtlich."
    />
</svelte:head>

<div class="site-container pt-12 md:pt-16">
    <header class="max-w-3xl">
        <h1 class="text-display text-ink">Unser Team</h1>
        <p class="mt-3 text-lede">
            Hinter dem Stamm stehen viele Ehrenamtliche. Hier siehst du, wer sich um welche Aufgabe kümmert und wen du bei
            Fragen ansprechen kannst. Fragen zu einer Gruppe beantworten die Gruppenleitungen – die Adressen stehen auf den
            Gruppenseiten und unter <a href="/kontakt" class="text-link">Kontakt</a>.
        </p>
    </header>

    {#if data.offices.length === 0}
        <p class="mt-10 border-t border-line pt-6 text-muted">Hier stellen wir bald unser Team vor.</p>
    {:else}
        {#each data.offices as office (office.id)}
            <section class="section-gap border-t border-line-strong pt-8" aria-labelledby="amt-{office.id}">
                <h2 id="amt-{office.id}" class="text-section text-brand">{office.name}</h2>
                {#if office.description}
                    <p class="mt-1.5 max-w-3xl leading-relaxed whitespace-pre-line">{office.description}</p>
                {/if}
                {#each office.emails as mail (mail.email)}
                    <p class="mt-1.5">
                        {mail.label || 'E-Mail'}: <a href="mailto:{mail.email}" class="text-link">{mail.email}</a>
                    </p>
                {/each}

                {#if office.holders.length}
                    <ul class="mt-6 space-y-6">
                        {#each office.holders as person (person.id)}
                            {@const key = `${office.id}:${person.id}`}
                            {@const long = (person.bio?.length ?? 0) > BIO_PREVIEW}
                            <li class="grid grid-cols-[56px_minmax(0,1fr)] gap-4 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-5">
                                {#if person.imageUrl}
                                    <img
                                        src={person.imageUrl}
                                        alt="Profilbild von {person.firstName}"
                                        width="72"
                                        height="72"
                                        loading="lazy"
                                        decoding="async"
                                        class="size-14 rounded-full object-cover sm:size-[72px]"
                                    />
                                {:else}
                                    <span
                                        class="flex size-14 items-center justify-center rounded-full bg-subtle text-2xl font-semibold text-muted sm:size-[72px]"
                                        aria-hidden="true">{person.firstName.charAt(0).toUpperCase()}</span
                                    >
                                {/if}
                                <div class="min-w-0">
                                    <p class="font-bold text-ink">
                                        {person.firstName}
                                        {#if sinceText(person.since)}<span class="font-normal text-muted"> · {sinceText(person.since)}</span>{/if}
                                    </p>
                                    {#if person.bio}
                                        <p class="mt-0.5 max-w-3xl leading-relaxed whitespace-pre-line">
                                            {long && !expanded.has(key)
                                                ? `${person.bio.slice(0, BIO_PREVIEW).trimEnd()} …`
                                                : person.bio}
                                        </p>
                                        {#if long}
                                            <button
                                                type="button"
                                                class="mt-1 text-link"
                                                aria-expanded={expanded.has(key)}
                                                on:click={() => toggle(key)}
                                            >
                                                {expanded.has(key) ? 'Weniger anzeigen' : 'Mehr lesen'}
                                            </button>
                                        {/if}
                                    {/if}
                                </div>
                            </li>
                        {/each}
                    </ul>
                {/if}
            </section>
        {/each}
        {#if people === 0}
            <p class="mt-10 text-small text-muted">
                Die Personen hinter den Ämtern stellen sich hier vor, sobald sie zugestimmt haben.
            </p>
        {/if}
    {/if}
</div>
