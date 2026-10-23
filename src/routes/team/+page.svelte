<script lang="ts">
    // „Unser Team“: Ämter aus dem Intern-Bereich mit den Personen, die der Anzeige im Profil zugestimmt haben.
    // Es erscheinen nur Vornamen (der Nachname kommt gar nicht erst vom Backend).
    import EmailButtons from '$lib/components/EmailButtons.svelte';
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

    function names(list: { firstName: string }[]) {
        const n = list.map((h) => h.firstName);
        return n.length <= 1 ? n.join('') : `${n.slice(0, -1).join(', ')} und ${n[n.length - 1]}`;
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

<section class="mx-auto max-w-5xl space-y-10 px-6 py-12">
    <header class="space-y-3">
        <h1 class="text-3xl font-bold text-gray-800">Unser Team</h1>
        <p class="leading-relaxed text-gray-700">
            Hinter dem Stamm stehen viele Ehrenamtliche. Hier siehst du, wer sich um welche Aufgabe kümmert und wie du die
            richtigen Ansprechpartner erreichst. Für Fragen zu einer Gruppe schau auf der jeweiligen Gruppenseite oder unter
            <a href="/kontakt" class="text-indigo-700 underline hover:text-indigo-900">Kontakt</a>.
        </p>
    </header>

    {#if data.offices.length === 0}
        <p class="border border-dashed border-gray-300 p-8 text-center text-gray-500">
            Hier stellen wir bald unser Team vor.
        </p>
    {:else}
        <div class="space-y-8">
            {#each data.offices as office (office.id)}
                <article class="border border-gray-300 bg-white" aria-labelledby="amt-{office.id}">
                    <div class="border-l-4 border-indigo-800 px-6 py-5 sm:px-8">
                        <h2 id="amt-{office.id}" class="text-2xl font-bold text-indigo-900">{office.name}</h2>
                        {#if office.holders.length}
                            <p class="mt-1 text-gray-600">{names(office.holders)}</p>
                        {/if}
                        {#if office.description}
                            <p class="mt-3 leading-relaxed whitespace-pre-line text-gray-700">{office.description}</p>
                        {/if}
                    </div>

                    {#if office.holders.length}
                        <ul class="grid gap-6 border-t border-gray-200 px-6 py-6 sm:grid-cols-2 sm:px-8">
                            {#each office.holders as person (person.id)}
                                {@const key = `${office.id}:${person.id}`}
                                {@const long = (person.bio?.length ?? 0) > BIO_PREVIEW}
                                <li class="flex gap-4">
                                    {#if person.imageUrl}
                                        <img
                                            src={person.imageUrl}
                                            alt="Profilbild von {person.firstName}"
                                            width="80"
                                            height="80"
                                            loading="lazy"
                                            decoding="async"
                                            class="size-20 shrink-0 rounded-full border border-gray-200 object-cover"
                                        />
                                    {:else}
                                        <span
                                            class="flex size-20 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-2xl font-bold text-indigo-800"
                                            aria-hidden="true">{person.firstName.charAt(0).toUpperCase()}</span
                                        >
                                    {/if}
                                    <div class="min-w-0 space-y-1">
                                        <p class="text-lg font-semibold text-gray-900">{person.firstName}</p>
                                        {#if sinceText(person.since)}
                                            <p class="text-sm text-gray-500">{sinceText(person.since)}</p>
                                        {/if}
                                        {#if person.bio}
                                            <p class="leading-relaxed whitespace-pre-line text-gray-700">
                                                {long && !expanded.has(key)
                                                    ? `${person.bio.slice(0, BIO_PREVIEW).trimEnd()} …`
                                                    : person.bio}
                                            </p>
                                            {#if long}
                                                <button
                                                    type="button"
                                                    class="text-sm text-indigo-700 underline hover:text-indigo-900"
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

                    {#if office.emails.length}
                        <div class="space-y-4 border-t border-gray-200 bg-gray-50 px-6 py-5 sm:px-8">
                            {#each office.emails as mail (mail.email)}
                                <div>
                                    <p class="text-gray-700">
                                        <span class="font-bold">{mail.label || 'E-Mail'}</span><br />{mail.email}
                                    </p>
                                    <EmailButtons email={mail.email} color="indigo" />
                                </div>
                            {/each}
                        </div>
                    {/if}
                </article>
            {/each}
        </div>
        {#if people === 0}
            <p class="text-sm text-gray-500">
                Die Personen hinter den Ämtern stellen sich hier vor, sobald sie zugestimmt haben.
            </p>
        {/if}
    {/if}
</section>
