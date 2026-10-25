<svelte:head>
    <title>Stamm Edelweißpiraten</title>
    <meta name="description" content="Pfadfinder in Bremen-Hastedt – Abenteuer, Gemeinschaft & wöchentliche Gruppenstunden für Kinder und Jugendliche." />
</svelte:head>

<script>
    import Map from '$lib/components/Map.svelte';
    import StammHeader from '$lib/components/StammHeader.svelte';
    import EventList from '$lib/components/EventList.svelte';
    import FaqList from '$lib/components/FaqList.svelte';
    import { formatNumericDate } from '$lib/dates';

    export let data;

    /** Hinweise für die Startseite (Intern-Bereich → Website → Banner, Platz „Startseite“) */
    $: homeBanners = data.banners.filter((b) => b.placement === 'home');

    /** @param {import('$lib/server/backend').Group} g */
    function meta(g) {
        const when = [g.weekday.toLowerCase(), g.time].filter(Boolean).join(' ');
        return [g.ageRange, when].filter(Boolean).join(' · ');
    }
</script>

<section class="relative h-[62vh] min-h-[400px] max-h-[640px] w-full overflow-hidden bg-[#1f2937]">
    <img src="/pfadfinder.avif" alt="Pfadfinder*innen des Stammes Edelweißpiraten" width="4896" height="3672"
         fetchpriority="high" decoding="async" class="absolute h-full w-full object-cover brightness-[0.68]" />
    <div class="absolute inset-0 flex items-center justify-center">
        <StammHeader />
    </div>
</section>

<div class="site-container pt-12 md:pt-16">
    {#if homeBanners.length}
        <div class="space-y-4">
            {#each homeBanners as banner (banner.id)}
                <aside
                    aria-label="Hinweis"
                    class="border px-5 py-4 text-ink {banner.level === 'important'
                        ? 'border-alert-line bg-alert'
                        : 'border-notice-line bg-notice'}"
                >
                    <p>
                        {#if banner.title}<strong>{banner.title}:</strong>{/if}
                        <span class="whitespace-pre-line">{banner.text}</span>
                    </p>
                    {#if banner.linkUrl}
                        <p class="mt-2">
                            <a
                                href={banner.linkUrl}
                                class="text-link"
                                target={banner.linkExternal ? '_blank' : undefined}
                                rel={banner.linkExternal ? 'noopener noreferrer' : undefined}
                            >{banner.linkLabel ?? 'Mehr erfahren'}</a>
                        </p>
                    {/if}
                </aside>
            {/each}
        </div>
    {/if}

    <section id="gruppen" aria-labelledby="h-gruppen" class={homeBanners.length ? 'section-gap' : ''}>
        <h2 id="h-gruppen" class="text-section text-ink">Unsere Gruppen</h2>
        <p class="mt-2 text-lede">Jede Gruppe trifft sich einmal in der Woche. Zum Schnuppern könnt ihr einfach vorbeikommen.</p>

        {#each data.groups as group, i (group.slug)}
            <article class="grid grid-cols-[72px_minmax(0,1fr)] gap-4 py-7 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-7 {i < data.groups.length - 1 ? 'border-b border-line' : ''}">
                {#if group.image}
                    <img src={group.image} alt="Gruppenbild {group.name}" width="120" height="120" loading="lazy" decoding="async" class="h-auto w-full" />
                {:else}
                    <span aria-hidden="true"></span>
                {/if}
                <div>
                    <h3 class="text-sub">
                        <a href={group.href} class="group-name hover:underline" style="--g: {group.color}">{group.typeLabel} – {group.name}</a>
                    </h3>
                    {#if meta(group)}<p class="mt-0.5 text-small text-muted tabular">{meta(group)}</p>{/if}
                    {#if group.teaser}<p class="mt-2">{group.teaser}</p>{/if}
                    <p class="mt-2"><a href={group.href} class="text-link">Mehr zur {group.typeLabel}</a></p>
                </div>
            </article>
        {:else}
            <p class="mt-6 text-muted">Die Gruppen konnten gerade nicht geladen werden – schau gern später noch einmal vorbei.</p>
        {/each}
    </section>

    <section class="section-gap" aria-labelledby="h-termine">
        <h2 id="h-termine" class="mb-5 text-section text-ink">Nächste Termine</h2>
        <EventList events={data.events} />
        <p class="border-t border-line pt-3"><a href="/termine" class="text-link">Alle Termine</a></p>
    </section>

    {#if data.posts.length}
        <section class="section-gap" aria-labelledby="h-aktuelles">
            <h2 id="h-aktuelles" class="mb-5 text-section text-ink">Aktuelles</h2>
            <ul class="border-t border-line">
                {#each data.posts as post (post.slug)}
                    <li class="border-b border-line py-4">
                        <p class="text-small text-muted"><time datetime={post.publishedOn}>{formatNumericDate(post.publishedOn)}</time></p>
                        <h3 class="mt-0.5 text-sub"><a href={post.href} class="text-ink hover:underline">{post.title}</a></h3>
                        {#if post.teaser}<p class="mt-1">{post.teaser}</p>{/if}
                    </li>
                {/each}
            </ul>
            <p class="pt-3"><a href="/blog" class="text-link">Zum Blog</a></p>
        </section>
    {/if}

    <section class="section-gap" aria-labelledby="h-ueber">
        <h2 id="h-ueber" class="mb-5 text-section text-ink">Über uns</h2>
        <div class="max-w-[68ch] space-y-4 text-[1.0625rem] leading-relaxed">
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

    <section class="section-gap grid gap-12 md:grid-cols-2">
        <div>
            <h2 id="h-faq" class="mb-5 text-section text-ink">Häufige Fragen</h2>
            <FaqList faqs={data.faqs} />
            <p class="pt-3"><a href="/faq" class="text-link">Alle Fragen</a></p>
        </div>
        <div>
            <h2 class="mb-5 text-section text-ink">Hier findest du uns</h2>
            <p class="mb-3">Ev. Auferstehungsgemeinde<br />Drakenburger Str. 42<br />28207 Bremen</p>
            <Map height="h-[260px]" />
        </div>
    </section>
</div>
