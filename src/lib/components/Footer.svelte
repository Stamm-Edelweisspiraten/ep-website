<script>
    import Icon from '$lib/components/Icon.svelte';

    /**
     * Gruppen aus dem Intern-Bereich (Layout-Load)
     * @type {import('$lib/server/backend').Group[]}
     */
    export let groups = [];

    /** @param {import('$lib/server/backend').Group} g */
    function short(g) {
        const day = g.weekday ? g.weekday.slice(0, 2) : '';
        const time = g.time.split(/[–\s]/)[0] ?? '';
        return [day, time].filter(Boolean).join(' ');
    }

    const route = 'https://www.openstreetmap.org/search?query=Drakenburger%20Stra%C3%9Fe%2042%2C%2028207%20Bremen';
</script>

<footer class="sitefoot">
    <div class="site-container">
        <div class="fcta">
            <div>
                <p class="display">Komm zur Probestunde</p>
                <p class="sub">Kostenlos und unverbindlich – sag uns kurz Bescheid, wir finden die passende Gruppe. In der Ev. Kirchengemeinde Bremen-Hastedt.</p>
            </div>
            <div class="acts">
                <a class="pill white" href="/probestunde">Probestunde anfragen<Icon name="arrow-right" size={18} /></a>
                <a class="pill dim" href="/kontakt">Frage stellen</a>
            </div>
        </div>

        <div class="fgrid">
            <div class="fbox brand">
                <div class="row">
                    <img src="/logo-sm.avif" alt="" width="44" height="65" loading="lazy" />
                    <div><b>Edelweißpiraten</b><p>Stamm der CPD in Bremen-Hastedt</p></div>
                </div>
                <p>Gruppenstunden, Fahrten und Lager für Kinder und Jugendliche in der Ev. Kirchengemeinde Bremen-Hastedt.</p>
                <div class="social">
                    <a href="https://instagram.com/edelweisspiraten_cpd" target="_blank" rel="noopener noreferrer" aria-label="Instagram (neues Fenster)"><Icon name="instagram" /></a>
                    <a href="/kontakt" aria-label="Kontakt"><Icon name="mail" /></a>
                    <a href="/blog/rss.xml" aria-label="RSS-Feed des Blogs"><Icon name="rss" /></a>
                </div>
            </div>
            {#if groups.length}
                <div class="fbox groups">
                    <h2><Icon name="users" size={18} />Gruppen</h2>
                    {#each groups as g (g.slug)}
                        <a class="g" href={g.href}><span>{g.name}</span><span class="tab">{short(g)}</span></a>
                    {/each}
                </div>
            {/if}
            <nav class="fbox links {groups.length ? '' : 'wide'}" aria-label="Fußmenü">
                <h2><Icon name="home" size={18} />Stamm</h2>
                <a href="/termine">Termine</a>
                <a href="/galerie">Galerie</a>
                <a href="/blog">Blog</a>
                <a href="/team">Unser Team</a>
                <a href="/faq">Häufige Fragen</a>
                <a href="/cpd">Unser Bund (CPD)</a>
            </nav>
            <div class="fbox kontakt">
                <h2><Icon name="map-pin" size={18} />So findest du uns</h2>
                <p>Ev. Kirchengemeinde Bremen-Hastedt<br />Drakenburger Str. 42<br />28207 Bremen</p>
                <a class="ln" href="/kontakt"><Icon name="mail" size={18} />Kontaktformular</a>
                <a class="ln" href={route} target="_blank" rel="noopener noreferrer"><Icon name="map" size={18} />Route planen</a>
            </div>
        </div>

        <div class="legal">
            <p>© {new Date().getFullYear()} Stamm Edelweißpiraten · Christliche Pfadfinderschaft Deutschlands e. V.</p>
            <div class="r">
                <a href="/impressum">Impressum</a>
                <a href="/datenschutz">Datenschutz</a>
                <a class="top" href="#inhalt" aria-label="Nach oben"><Icon name="chevron-up" /></a>
            </div>
            <!-- Bot-Falle (lib/server/bot-trap.ts): für Menschen unsichtbar und nicht erreichbar, in robots.txt gesperrt -->
            <a
                class="trail"
                href="/pfad-ins-unterholz"
                rel="nofollow"
                tabindex="-1"
                aria-hidden="true"
                data-sveltekit-reload
                data-sveltekit-preload-data="off">Archiv</a
            >
        </div>
    </div>
</footer>

<style>
    .sitefoot {
        background: var(--color-foot);
        color: #fff;
        margin-top: clamp(72px, 7vw, 112px);
        padding-bottom: 28px;
    }
    .fcta {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 32px;
        align-items: center;
        padding-block: 72px 56px;
    }
    .fcta .display {
        font-size: clamp(52px, 6.4vw, 96px);
        color: #fff;
    }
    .sub {
        color: var(--color-foot-text);
        font-size: 17px;
        margin-top: 12px;
        max-width: 52ch;
    }
    .fgrid {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 8px;
    }
    .fbox {
        background: var(--color-foot-2);
        padding: 28px;
        display: flex;
        flex-direction: column;
        gap: 14px;
    }
    .fbox h2 {
        font-size: 15px;
        font-weight: 600;
        color: #fff;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .fbox a,
    .fbox p {
        color: var(--color-foot-text);
        text-decoration: none;
        font-size: 15px;
    }
    .fbox a:hover {
        color: #fff;
    }
    .ln {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .brand {
        grid-column: span 4;
        justify-content: space-between;
    }
    .brand .row {
        display: flex;
        align-items: center;
        gap: 14px;
    }
    .brand img {
        width: 44px;
        height: auto;
        display: block;
    }
    .brand b {
        font-size: 22px;
        font-weight: 600;
        color: #fff;
    }
    .social {
        display: flex;
        gap: 8px;
    }
    .social a {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: #2e2e32;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
    }
    .social a:hover {
        background: #3b3b40;
    }
    .groups {
        grid-column: span 3;
    }
    .groups .g {
        display: flex;
        justify-content: space-between;
        gap: 12px;
    }
    .groups .g span:last-child {
        color: #fff;
    }
    .links {
        grid-column: span 2;
    }
    .links.wide {
        grid-column: span 5;
    }
    .kontakt {
        grid-column: span 3;
    }
    .legal {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        margin-top: 28px;
        font-size: 13px;
        color: #8e8e92;
        flex-wrap: wrap;
    }
    .legal .r {
        display: flex;
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;
    }
    .legal a {
        color: #b8b8bb;
        text-decoration: none;
    }
    .legal a:hover {
        color: #fff;
    }
    .trail {
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
    }
    .legal .top {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: var(--color-foot-2);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #fff;
    }
    @media (max-width: 62rem) {
        .brand,
        .groups,
        .links,
        .links.wide,
        .kontakt {
            grid-column: span 6;
        }
    }
    @media (max-width: 50rem) {
        .fcta {
            grid-template-columns: 1fr;
            padding-block: 56px 40px;
        }
        .fcta .display {
            font-size: clamp(48px, 15vw, 72px);
        }
        .brand,
        .groups,
        .links,
        .links.wide,
        .kontakt {
            grid-column: 1 / -1;
        }
        .legal {
            flex-direction: column;
            align-items: flex-start;
        }
    }
</style>
