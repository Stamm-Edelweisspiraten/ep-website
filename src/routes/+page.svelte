<svelte:head>
    <title>Stamm Edelweißpiraten</title>
    <meta name="description" content="Pfadfinder in Bremen-Hastedt – Abenteuer, Gemeinschaft & wöchentliche Gruppenstunden für Kinder und Jugendliche." />
</svelte:head>

<script>
    import Map from '$lib/components/Map.svelte';
    import StammHeader from '$lib/components/StammHeader.svelte';
    import EventList from '$lib/components/EventList.svelte';

    export let data;

    /** Ferienhinweis (statisch gepflegt): `show: false` blendet ihn aus */
    const ferien = {
        show: true,
        text: 'In den Ferien finden keine Gruppenstunden statt.',
        groups: [
            { name: 'Meute', href: '/meute', color: '#c05621', note: 'startet wieder am 21.08.' },
            { name: 'Die Goldenen Löwenzähne', href: '/sippe/die-goldenen-loewenzaehne', color: '#d69e2e', note: 'starten wieder am 14.08.' },
            { name: 'Funkelfüchse', href: '/sippe/funkelfuechse', color: '#d53f8c', note: 'starten am 21.08. mit aktiven Gruppenstunden.' }
        ]
    };

    /** @type {number | null} */
    let openFaq = null;

    /** @param {import('$lib/server/backend').Group} g */
    function meta(g) {
        const when = [g.weekday.toLowerCase(), g.time].filter(Boolean).join(' ');
        return [g.ageRange, when].filter(Boolean).join(' · ');
    }
</script>

<section class="relative h-[60vh] min-h-[380px] max-h-[600px] w-full overflow-hidden bg-gray-700">
    <img src="/pfadfinder.avif" alt="Pfadfinder*innen des Stammes Edelweißpiraten"
         class="absolute h-full w-full object-cover brightness-[0.72]" />
    <div class="absolute inset-0 flex items-center justify-center">
        <StammHeader />
    </div>
</section>

<div class="mx-auto max-w-5xl px-6 pt-12">
    {#if ferien.show}
        <div class="mb-14 border border-notice-line bg-notice px-5 py-4 text-ink">
            <p><strong>Ferien:</strong> {ferien.text}</p>
            {#if ferien.groups.length}
                <ul class="mt-2 space-y-0.5 text-[15px] text-body">
                    {#each ferien.groups as g (g.name)}
                        <li><a href={g.href} class="group-name font-semibold hover:underline" style="--g: {g.color}">{g.name}</a> {g.note}</li>
                    {/each}
                </ul>
            {/if}
        </div>
    {/if}

    <section id="gruppen" aria-labelledby="h-gruppen">
        <h2 id="h-gruppen" class="text-[28px] font-bold text-ink">Unsere Gruppen</h2>
        <p class="mt-1">Jede Gruppe trifft sich einmal in der Woche. Zum Schnuppern könnt ihr einfach vorbeikommen.</p>

        {#each data.groups as group, i (group.slug)}
            <article class="grid grid-cols-[72px_minmax(0,1fr)] gap-4 py-7 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-7 {i < data.groups.length - 1 ? 'border-b border-line' : ''}">
                {#if group.image}
                    <img src={group.image} alt="Gruppenbild {group.name}" width="120" height="120" loading="lazy" decoding="async" class="h-auto w-full" />
                {:else}
                    <span></span>
                {/if}
                <div>
                    <h3 class="text-[22px] font-bold leading-snug">
                        <a href={group.href} class="group-name hover:underline" style="--g: {group.color}">{group.typeLabel} – {group.name}</a>
                    </h3>
                    {#if meta(group)}<p class="text-muted">{meta(group)}</p>{/if}
                    {#if group.teaser}<p class="mt-2">{group.teaser}</p>{/if}
                    <p class="mt-2"><a href={group.href} class="text-link">Mehr zur {group.typeLabel}</a></p>
                </div>
            </article>
        {:else}
            <p class="mt-6 text-muted">Die Gruppen konnten gerade nicht geladen werden – schau gern später noch einmal vorbei.</p>
        {/each}
    </section>

    <section class="pt-12" aria-labelledby="h-termine">
        <h2 id="h-termine" class="mb-4 text-[28px] font-bold text-ink">Nächste Termine</h2>
        <EventList events={data.events} />
        <p class="border-t border-line pt-3"><a href="/termine" class="text-link">Alle Termine</a></p>
    </section>

    <section class="pt-12" aria-labelledby="h-ueber">
        <h2 id="h-ueber" class="mb-4 text-[28px] font-bold text-ink">Über uns</h2>
        <div class="max-w-3xl space-y-3.5 leading-relaxed">
            <p>
                Wir sind der <strong class="text-ink">Stamm Edelweißpiraten</strong> der Christlichen Pfadfinderschaft Deutschlands e.V. (CPD).
                Unser Zuhause ist Bremen-Hastedt, wo wir eng mit der Evangelischen Auferstehungsgemeinde zusammenarbeiten.
                Als Teil der CPD bieten wir Kindern und Jugendlichen eine lebendige Gemeinschaft, in der Abenteuer, Freundschaft und
                Verantwortung großgeschrieben werden.
            </p>
            <p>
                Neben unseren wöchentlichen Gruppenstunden unternehmen wir regelmäßig spannende Fahrten und Aktionen. Ob im Wald,
                am Lagerfeuer oder auf einem Zeltplatz – bei uns gibt es immer etwas zu erleben.
            </p>
            <p>Jede und jeder ist willkommen – komm vorbei und mach mit!</p>
        </div>
    </section>

    <section class="grid gap-12 pt-12 md:grid-cols-2">
        <div>
            <h2 class="mb-4 text-[28px] font-bold text-ink">Häufige Fragen</h2>
            <div class="border-t border-line-strong">
                {#each data.faqs as faq, index (faq.id)}
                    <div class="border-b border-line-strong">
                        <button
                                type="button"
                                class="flex w-full items-center justify-between gap-4 py-3.5 text-left font-semibold text-ink"
                                aria-expanded={openFaq === index}
                                aria-controls="faq-{faq.id}"
                                on:click={() => (openFaq = openFaq === index ? null : index)}
                        >
                            {faq.question}
                            <span class="text-xl text-muted" aria-hidden="true">{openFaq === index ? '−' : '+'}</span>
                        </button>
                        {#if openFaq === index}
                            <p id="faq-{faq.id}" class="pb-3.5">{faq.answer}</p>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
        <div>
            <h2 class="mb-4 text-[28px] font-bold text-ink">Hier findest du uns</h2>
            <p class="mb-3">Ev. Auferstehungsgemeinde<br />Drakenburger Str. 42<br />28207 Bremen</p>
            <Map height="h-[260px]" />
        </div>
    </section>
</div>
