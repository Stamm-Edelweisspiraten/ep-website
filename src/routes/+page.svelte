
<script>
    import EventList from '$lib/components/EventList.svelte';
    import FaqList from '$lib/components/FaqList.svelte';
    import Icon from '$lib/components/Icon.svelte';
    import ContactGuard from '$lib/components/ContactGuard.svelte';
    import Seo from '$lib/components/Seo.svelte';
    import { organization, website } from '$lib/seo';
    import { formatLongDate, formatMonth } from '$lib/dates';

    export let data;

    /** Hinweise für die Startseite (Intern-Bereich → Website → Banner, Platz „Startseite“) */
    $: homeBanners = data.banners.filter((b) => b.placement === 'home');

    /** Tage der Gruppenstunden („Mo und Fr“) aus den Gruppen */
    const DAY_ORDER = ['Montags', 'Dienstags', 'Mittwochs', 'Donnerstags', 'Freitags', 'Samstags', 'Sonntags'];
    $: days = DAY_ORDER.filter((d) => data.groups.some((g) => g.weekday === d)).map((d) => d.slice(0, 2));
    $: daysText = days.length ? days.join(days.length === 2 ? ' und ' : ', ') : '';
    $: daysLong = DAY_ORDER.filter((d) => data.groups.some((g) => g.weekday === d))
        .map((d) => d.toLowerCase())
        .join(' und ');

    /** Bild für die zweite Kampagnen-Kachel: Titelbild der neuesten Galerie in groß */
    $: campImage = data.galleries[0]?.cover
        ? { url: data.galleries[0].cover.url.replace(/\/thumb$/, '/web'), alt: data.galleries[0].title }
        : null;

    /** „Zuletzt unterwegs“: neueste Galerien und Beiträge gemischt */
    $: recent = [
        ...data.galleries.map((g) => ({
            key: `g-${g.id}`,
            kind: 'Galerie',
            href: `/galerie/${g.id}`,
            title: g.title,
            img: g.cover?.url ?? null,
            meta: `${g.imageCount} Bilder · ${formatMonth(g.date)}`,
            date: g.date
        })),
        ...data.posts.map((p) => ({
            key: `p-${p.slug}`,
            kind: 'Blog',
            href: p.href,
            title: p.title,
            img: p.cover?.url ?? null,
            meta: [formatLongDate(p.publishedOn), p.authorName].filter(Boolean).join(' · '),
            date: p.publishedOn
        }))
    ]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 4);

    /** Jüngstes Mindestalter der Website-Gruppen („ab 6 Jahren“), Rückfall 6 */
    $: ages = data.groups.map((g) => g.ageMin).filter((n) => n != null);
    $: minAge = ages.length ? Math.min(...ages) : 6;

    /** @type {HTMLDivElement | undefined} */
    let rail;
    /** @param {number} dir */
    function scrollRail(dir) {
        rail?.scrollBy({ left: dir * rail.clientWidth * 0.7, behavior: 'smooth' });
    }
</script>

<Seo
    title="Pfadfinder Bremen-Hastedt & Hemelingen – Stamm Edelweißpiraten"
    description={`Pfadfinder in Bremen: Der Stamm Edelweißpiraten (CPD) in Hastedt, Stadtteil Hemelingen – Gruppenstunden, Fahrten und Lager für Kinder und Jugendliche ab ${minAge} Jahren. Probestunde kostenlos.`}
    path="/"
    jsonLd={(base) => [organization(base), website(base)]}
/>

<section class="site-container" aria-labelledby="h-hero">
    <div class="camp hero">
        <img
            src="/pfadfinder-1280.avif"
            srcset="/pfadfinder-1280.avif 1280w, /pfadfinder-2400.avif 2400w, /pfadfinder.avif 4896w"
            sizes="(max-width: 90rem) 100vw, 90rem"
            alt="Schwarze Kohten und Banner der Pfadfinder Edelweißpiraten aus Bremen am Rand eines Kornfelds vor hohen Bäumen" width="4896" height="3672" fetchpriority="high" decoding="async" />
        <div class="scrim"></div>
        <div class="lock">
            <h1 class="display" id="h-hero">Pfadfinder<br />in Hastedt</h1>
            <p>Gruppenstunden, Fahrten und Lager für Kinder und Jugendliche ab {minAge} Jahren. Die erste Gruppenstunde ist kostenlos und ohne Anmeldung.</p>
            <div class="acts" style="margin-top: 8px">
                <a class="pill white" href="#gruppen">Gruppe finden<Icon name="arrow-right" size={18} /></a>
                <a class="pill glass" href="/termine"><Icon name="calendar" size={18} />Nächste Termine</a>
            </div>
        </div>
    </div>
</section>

{#if homeBanners.length}
    <section class="site-container notes" aria-label="Hinweise">
        {#each homeBanners as banner (banner.id)}
            <aside class="note {banner.level === 'important' ? 'important' : ''}">
                <span class="ic"><Icon name={banner.level === 'important' ? 'alert' : 'info'} /></span>
                <div>
                    {#if banner.title}<h2>{banner.title}</h2>{/if}
                    <p class="whitespace-pre-line">{banner.text}</p>
                    {#if banner.linkUrl}
                        <p style="margin-top: 10px">
                            <a
                                href={banner.linkUrl}
                                class="ulink"
                                target={banner.linkExternal ? '_blank' : undefined}
                                rel={banner.linkExternal ? 'noopener noreferrer' : undefined}
                            >{banner.linkLabel ?? 'Mehr erfahren'}<Icon name="arrow-right" size={18} /></a>
                        </p>
                    {/if}
                </div>
            </aside>
        {/each}
    </section>
{/if}

<section class="site-container section-gap" aria-labelledby="h-intro">
    <div class="intro">
        <h2 class="h-xl" id="h-intro">Jede Woche raus, Neues lernen und Freunde finden. Im Stamm Edelweißpiraten der Christlichen Pfadfinderschaft.</h2>
        <div class="r">
            <p>
                Wir treffen uns {daysLong || 'jede Woche'} bei der Ev. Kirchengemeinde Bremen-Hastedt. In der Gruppenstunde
                wird gespielt, gebaut, gesungen und draußen getobt. Mehrmals im Jahr geht es auf Fahrt und ins Zeltlager.
            </p>
            <p><a class="ulink" href="#ueber">Mehr über uns<Icon name="arrow-right" size={18} /></a></p>
        </div>
    </div>
    <dl class="facts" style="margin-top: 64px">
        <div class="fact"><dt><span class="ic" aria-hidden="true"><Icon name="users" /></span>Alter</dt><dd>ab {minAge} Jahren</dd></div>
        <div class="fact"><dt><span class="ic" aria-hidden="true"><Icon name="clock" /></span>Gruppenstunde, jede Woche</dt><dd>{daysText || 'einmal pro Woche'}</dd></div>
        <div class="fact"><dt><span class="ic" aria-hidden="true"><Icon name="map-pin" /></span>Ort</dt><dd>Drakenburger Str. 42</dd></div>
        <div class="fact"><dt><span class="ic" aria-hidden="true"><Icon name="euro" /></span>Beitrag</dt><dd>47 € im Jahr</dd></div>
    </dl>
</section>

<section class="site-container section-gap" id="gruppen" aria-labelledby="h-gruppen">
    <div class="rowhead">
        <h2 class="h-xl" id="h-gruppen">Unsere Gruppen</h2>
        {#if data.groups.length > 3}
            <div class="railnav">
                <button class="round" type="button" aria-label="Vorherige Gruppen" aria-controls="gruppen-rail" on:click={() => scrollRail(-1)}><Icon name="chevron-left" /></button>
                <button class="round" type="button" aria-label="Weitere Gruppen" aria-controls="gruppen-rail" on:click={() => scrollRail(1)}><Icon name="chevron-right" /></button>
            </div>
        {:else}
            <a class="ulink" href="/kontakt">Fragen zur Probestunde</a>
        {/if}
    </div>
    {#if data.groups.length}
        <div class="rail" id="gruppen-rail" bind:this={rail} role="region" aria-label="Gruppen" tabindex="-1">
            {#each data.groups as g (g.slug)}
                <a class="gcard" href={g.href}>
                    <div class="img">
                        {#if g.image}<img src={g.thumb ?? g.image} srcset={g.thumb && g.thumb !== g.image ? `${g.thumb} 640w, ${g.image} 1600w` : undefined} sizes="(max-width: 50rem) 80vw, 330px" alt="" width="500" height="500" loading="lazy" decoding="async" />{:else}<img src="/logo.avif" alt="" width="676" height="1000" class="seal" loading="lazy" />{/if}
                        <span class="go"><Icon name="arrow-right" /></span>
                    </div>
                    <p class="n">{g.name}</p>
                    <p class="cap meta"><Icon name="user" size={18} />{[g.typeLabel, g.ageRange].filter(Boolean).join(' · ')}</p>
                    {#if g.weekday || g.time}<p class="when tab"><Icon name="clock" size={18} />{[g.weekday, g.time].filter(Boolean).join(' ')}</p>{/if}
                </a>
            {/each}
        </div>
    {:else}
        <p class="empty">Die Gruppen konnten gerade nicht geladen werden – schau gern später noch einmal vorbei.</p>
    {/if}
</section>

{#if campImage}
    <section class="site-container section-gap" aria-labelledby="h-fahrt">
        <div class="camp camp2">
            <img src={campImage.url} alt={campImage.alt} loading="lazy" decoding="async" />
            <div class="scrim"></div>
            <div class="lock">
                <h2 class="display" id="h-fahrt">Fahrten<br />und Lager</h2>
                <div class="marks">
                    <span><Icon name="tent" />Zeltlager</span>
                    <span><Icon name="flame" />Lagerfeuer</span>
                    <span><Icon name="mountain" />Wochenendfahrten</span>
                </div>
                <div class="acts">
                    <a class="pill white" href="/termine">Termine ansehen<Icon name="arrow-right" size={18} /></a>
                    <a class="pill glass" href="/galerie"><Icon name="image" size={18} />Galerie</a>
                </div>
            </div>
        </div>
    </section>
{/if}

<section class="site-container section-gap" aria-labelledby="h-termine">
    <div class="rowhead">
        <h2 class="h-xl" id="h-termine">Nächste Termine</h2>
        <a class="ulink" href="/termine"><Icon name="calendar" size={18} />Alle Termine</a>
    </div>
    <EventList events={data.events} />
</section>

{#if recent.length}
    <section class="site-container section-gap" aria-labelledby="h-unterwegs">
        <div class="rowhead">
            <h2 class="h-xl" id="h-unterwegs">Zuletzt unterwegs</h2>
            <p style="display: flex; gap: 20px"><a class="ulink" href="/galerie">Galerie</a><a class="ulink" href="/blog">Blog</a></p>
        </div>
        <div class="grid4">
            {#each recent as r (r.key)}
                <a class="tile" href={r.href}>
                    <div class="ph">
                        {#if r.img}
                            <img src={r.img} alt="" width="640" height="480" loading="lazy" decoding="async" />
                        {:else}
                            <span class="noimg"><img src="/logo.avif" alt="" width="676" height="1000" loading="lazy" /></span>
                        {/if}
                        <span class="pill white"><Icon name={r.kind === 'Blog' ? 'pen' : 'image'} size={16} />{r.kind}</span>
                    </div>
                    <p class="n">{r.title}</p>
                    <p class="cap">{r.meta}</p>
                </a>
            {/each}
        </div>
    </section>
{/if}

<section class="site-container section-gap" id="ueber" aria-labelledby="h-ueber">
    <div class="about">
        <div class="seal"><img src="/logo.avif" alt="Wappen des Stammes Edelweißpiraten mit Lilie und Edelweiß" width="676" height="1000" loading="lazy" /></div>
        <div class="txt">
            <h2 class="h-xl" id="h-ueber">Über uns</h2>
            <p>
                Wir sind die Pfadfinder vom Stamm Edelweißpiraten in der Christlichen Pfadfinderschaft Deutschlands e. V. (CPD). Unser Zuhause ist
                Bremen-Hastedt im Stadtteil Hemelingen, wo wir eng mit der Ev. Kirchengemeinde Bremen-Hastedt zusammenarbeiten.
                Zu uns kommen Kinder und Jugendliche aus Hastedt, Hemelingen und ganz Bremen. Als Teil der CPD bieten wir
                Kindern und Jugendlichen eine lebendige Gemeinschaft, in der Abenteuer, Freundschaft und Verantwortung großgeschrieben werden.
            </p>
            <p>Jede und jeder ist willkommen – komm vorbei und mach mit!</p>
            <ul class="values">
                <li><Icon name="mountain" size={24} />Abenteuer</li>
                <li><Icon name="heart" size={24} />Freundschaft</li>
                <li><Icon name="shield" size={24} />Verantwortung</li>
            </ul>
            <div class="acts"><a class="pill" href="/team">Unser Team</a><a class="pill soft" href="/cpd">Über die CPD</a></div>
        </div>
    </div>
</section>

{#if data.faqs.length}
    <section class="site-container section-gap" id="faq" aria-labelledby="h-faq">
        <div class="faqwrap">
            <div class="side">
                <h2 class="h-xl" id="h-faq">Häufige Fragen</h2>
                <p class="lead2">Was Eltern und Kinder vor der ersten Gruppenstunde am häufigsten wissen wollen.</p>
                <div class="abox" style="margin-top: 12px">
                    <span class="ic" style="width: 48px; height: 48px"><Icon name="question" /></span>
                    <h3>Deine Frage ist nicht dabei?</h3>
                    <p>Schreib uns. Die Gruppenleitung antwortet dir per E-Mail.</p>
                    <div class="acts" style="align-items: center; gap: 16px"><a class="pill" href="#kontakt">Frage stellen</a><a class="ulink" href="/faq">Alle Fragen</a></div>
                </div>
            </div>
            <div class="main">
                <FaqList faqs={data.faqs} openFirst />
            </div>
        </div>
    </section>
{/if}

<section class="site-container section-gap" id="kontakt" aria-labelledby="h-kontakt">
    <div class="contact">
        <div class="info">
            <h2 class="h-xl" id="h-kontakt">Kontakt</h2>
            <div class="row"><span class="ic sub"><Icon name="map-pin" /></span><div><h3>Treffpunkt</h3><p>Ev. Kirchengemeinde Bremen-Hastedt<br />Drakenburger Str. 42, 28207 Bremen</p></div></div>
            {#if data.groups.length}
                <div class="row">
                    <span class="ic sub"><Icon name="clock" /></span>
                    <div>
                        <h3>Gruppenstunden</h3>
                        <p class="tab">
                            {#each data.groups as g, i (g.slug)}{#if i > 0}<br />{/if}{[g.weekday.slice(0, 2), g.time.split(/[–\s]/)[0]].filter(Boolean).join(' ')} {g.name}{/each}
                        </p>
                    </div>
                </div>
            {/if}
            <div class="row"><span class="ic sub"><Icon name="map" /></span><div><h3>Karte und Anfahrt</h3><p>Die Karte lädt erst nach Klick von OpenStreetMap.</p><p style="margin-top: 10px"><a class="pill soft" href="/kontakt#karte">Zur Karte</a></p></div></div>
        </div>
        <form method="POST" action="/kontakt">
            <div class="hp" aria-hidden="true"><label>Website <input type="text" name="website" tabindex="-1" autocomplete="off" /></label><label>Bitte leer lassen <input type="text" name="fax" tabindex="-1" autocomplete="off" /></label></div>
            <div class="fld"><label class="label" for="k-name">Name</label><input class="field" id="k-name" name="name" type="text" required maxlength="100" autocomplete="name" /></div>
            <div class="fld"><label class="label" for="k-mail">E-Mail</label><input class="field" id="k-mail" name="email" type="email" required maxlength="254" autocomplete="email" /></div>
            <div class="fld full"><label class="label" for="k-text">Nachricht</label><textarea class="field" id="k-text" name="message" required maxlength="5000"></textarea></div>
            <div class="consent full">
                <input id="k-ok" name="consent" type="checkbox" required />
                <label for="k-ok">Ich habe die <a href="/datenschutz#m182" class="text-link">Hinweise zum Datenschutz</a> gelesen und bin einverstanden, dass meine Angaben zur Beantwortung verarbeitet werden.</label>
            </div>
            <ContactGuard />
            <div class="formfoot full">
                <p class="cap">Wir nutzen deine Angaben nur, um dir zu antworten.</p>
                <button class="pill" type="submit"><Icon name="send" size={18} />Nachricht senden</button>
            </div>
        </form>
    </div>
</section>

<style>
    .hero > img {
        height: min(760px, 56vw);
        min-height: 520px;
    }
    .hero .display {
        font-size: clamp(64px, 9.6vw, 148px);
    }
    .hero .lock p {
        font-size: 18px;
        max-width: 46ch;
    }
    .camp2 > img {
        height: min(640px, 44vw);
        min-height: 440px;
    }
    .camp2 .display {
        font-size: clamp(56px, 7.2vw, 112px);
    }
    .marks {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
        font-size: 16px;
    }
    .marks span {
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }

    .notes {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 8px;
    }
    .note {
        background: var(--color-subtle);
        padding: 24px;
        display: flex;
        gap: 16px;
        align-items: flex-start;
        color: var(--color-ink);
    }
    .note.important {
        background: var(--color-ink);
        color: var(--color-on-ink);
    }
    .note.important .ic {
        background: var(--color-on-ink);
        color: var(--color-ink);
    }
    .note.important .ulink {
        color: inherit;
    }
    .note h2 {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 4px;
    }

    .intro {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 24px;
        align-items: start;
    }
    .intro h2 {
        grid-column: 1 / span 6;
    }
    .intro .r {
        grid-column: 8 / span 5;
        display: flex;
        flex-direction: column;
        gap: 20px;
        font-size: 17px;
        color: var(--color-body);
    }

    .railnav {
        display: flex;
        gap: 8px;
    }
    .rail {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
        scrollbar-width: none;
        padding-bottom: 4px;
    }
    .rail::-webkit-scrollbar {
        display: none;
    }
    .gcard {
        flex: 0 0 calc((100% - 16px) / 3);
        scroll-snap-align: start;
        text-decoration: none;
        display: flex;
        flex-direction: column;
        gap: 6px;
        color: var(--color-ink);
    }
    .gcard .img {
        position: relative;
        background: var(--color-subtle);
        aspect-ratio: 1 / 1;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 10px;
        transition: background 0.2s ease;
    }
    .gcard:hover .img {
        background: var(--color-subtle-2);
    }
    .gcard .img img {
        width: 62%;
        height: 62%;
        object-fit: contain;
        display: block;
    }
    .gcard .img img.seal {
        width: 34%;
    }
    .gcard .go {
        position: absolute;
        right: 16px;
        bottom: 16px;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: var(--color-page);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
    }
    .gcard:hover .go {
        transform: translateX(3px);
    }
    .gcard .n {
        font-size: 18px;
        font-weight: 500;
    }
    .gcard .meta,
    .gcard .when {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .noimg {
        display: flex;
        aspect-ratio: 4 / 3;
        align-items: center;
        justify-content: center;
    }
    .noimg img {
        width: 22% !important;
        height: auto !important;
        aspect-ratio: auto !important;
    }

    .about {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 24px;
        align-items: center;
    }
    .about .seal {
        grid-column: 1 / span 5;
        background: var(--color-subtle);
        aspect-ratio: 1 / 1;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .about .seal img {
        width: 38%;
        height: auto;
        display: block;
    }
    .about .txt {
        grid-column: 7 / span 6;
        display: flex;
        flex-direction: column;
        gap: 20px;
        font-size: 17px;
        color: var(--color-body);
    }
    .values {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
        margin-top: 8px;
    }
    .values li {
        background: var(--color-subtle);
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        color: var(--color-ink);
        font-weight: 500;
    }

    .faqwrap {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 24px;
        align-items: start;
    }
    .faqwrap .side {
        grid-column: 1 / span 4;
        position: sticky;
        top: 24px;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    .lead2 {
        font-size: 17px;
        color: var(--color-body);
        max-width: 36ch;
    }
    .faqwrap .main {
        grid-column: 6 / span 7;
    }

    .contact {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 24px;
    }
    .contact .info {
        grid-column: 1 / span 4;
        display: flex;
        flex-direction: column;
        gap: 24px;
    }
    .contact .row {
        display: flex;
        gap: 14px;
        align-items: flex-start;
    }
    .contact .row p {
        color: var(--color-body);
    }
    .ic.sub {
        background: var(--color-subtle);
    }
    .contact .row h3 {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 2px;
    }
    form {
        grid-column: 6 / span 7;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
    }
    .fld {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    .full {
        grid-column: 1 / -1;
    }
    .hp {
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
    }
    .consent {
        display: flex;
        gap: 14px;
        align-items: flex-start;
        background: var(--color-subtle);
        padding: 16px 20px;
        font-size: 15px;
        color: var(--color-body);
    }
    .consent input {
        width: 22px;
        height: 22px;
        margin: 1px 0 0;
        accent-color: var(--color-ink);
        flex: none;
    }
    .formfoot {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
    }

    @media (max-width: 50rem) {
        .hero > img {
            height: 620px;
            min-height: 0;
        }
        .hero .display {
            font-size: 17vw;
        }
        .hero .lock p {
            font-size: 16px;
        }
        .camp2 > img {
            height: 520px;
            min-height: 0;
        }
        .camp2 .display {
            font-size: 15vw;
        }
        .intro h2,
        .intro .r,
        .about .seal,
        .about .txt,
        .faqwrap .side,
        .faqwrap .main,
        .contact .info,
        form {
            grid-column: 1 / -1;
        }
        .faqwrap .side {
            position: static;
        }
        .about .seal {
            aspect-ratio: 16 / 10;
        }
        .values {
            grid-template-columns: 1fr;
        }
        .gcard {
            flex-basis: 78%;
        }
        form {
            grid-template-columns: 1fr;
        }
    }
</style>
