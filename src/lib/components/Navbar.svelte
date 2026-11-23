<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import ThemeToggle from '$lib/components/ThemeToggle.svelte';
    import Icon from '$lib/components/Icon.svelte';

    /**
     * Gruppen aus dem Intern-Bereich (Layout-Load)
     * @type {import('$lib/server/backend').Group[]}
     */
    export let groups = [];

    // Meute(n) zuerst, dann Sippe(n)
    $: sections = [
        { label: 'Meute', groups: groups.filter((g) => g.type === 'meute') },
        { label: 'Sippe', groups: groups.filter((g) => g.type === 'sippe') }
    ].filter((s) => s.groups.length > 0);

    const links = [
        { href: '/termine', label: 'Termine' },
        { href: '/galerie', label: 'Galerie' },
        { href: '/blog', label: 'Blog' }
    ];
    const about = [
        { href: '/team', label: 'Unser Team' },
        { href: '/cpd', label: 'Unser Bund (CPD)' },
        { href: '/faq', label: 'Häufige Fragen' },
        { href: '/spenden', label: 'Spenden' },
        { href: '/kontakt', label: 'Kontakt' }
    ];

    let open = false;
    /** @type {'' | 'gruppen' | 'about'} */
    let dropdown = '';

    $: path = $page.url.pathname;
    $: inGroups = path.startsWith('/meute') || path.startsWith('/sippe');
    $: inAbout = about.some((l) => active(l.href, path));
    /** @param {string} href @param {string} p */
    const active = (href, p) => p === href || p.startsWith(`${href}/`);

    // Menüs nach dem Seitenwechsel schließen
    $: path, (open = false), (dropdown = '');

    /** @param {'gruppen' | 'about'} which */
    function toggle(which) {
        dropdown = dropdown === which ? '' : which;
    }

    /** @param {MouseEvent} event */
    function handleClickOutside(event) {
        const target = /** @type {HTMLElement} */ (event.target);
        if (!target.closest?.('[data-dropdown]')) dropdown = '';
    }

    /** @param {KeyboardEvent} event */
    function handleKey(event) {
        if (event.key === 'Escape') {
            dropdown = '';
            open = false;
        }
    }

    onMount(() => {
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    });
</script>

<svelte:window on:keydown={handleKey} />

<header class="site-container nav">
    <a class="mark" href="/" translate="no"><img src="/logo-sm.avif" alt="" width="26" height="38" /><span>Edelweißpiraten</span></a>

    <nav class="links" aria-label="Hauptmenü">
        <div class="dd" data-dropdown>
            <button
                type="button"
                class="nl {inGroups ? 'is-active' : ''}"
                aria-expanded={dropdown === 'gruppen'}
                aria-controls="dd-gruppen"
                on:click={() => toggle('gruppen')}
            >Gruppen<Icon name="chevron-down" size={16} /></button>
            {#if dropdown === 'gruppen'}
                <div id="dd-gruppen" class="panel">
                    {#each sections as section (section.label)}
                        <p class="pl">{section.label}</p>
                        {#each section.groups as group (group.slug)}
                            <a href={group.href} class="pi" aria-current={active(group.href, path) ? 'page' : undefined}
                                ><span class="dot" style="--g: {group.color}"></span>{group.name}</a
                            >
                        {/each}
                    {/each}
                    {#if sections.length === 0}
                        <p class="pl">Die Gruppen konnten gerade nicht geladen werden.</p>
                    {/if}
                    <a href="/#gruppen" class="pi all">Alle Gruppen auf einen Blick</a>
                </div>
            {/if}
        </div>
        {#each links as link (link.href)}
            <a href={link.href} class="nl {active(link.href, path) ? 'is-active' : ''}" aria-current={active(link.href, path) ? 'page' : undefined}
                >{link.label}</a
            >
        {/each}
        <div class="dd" data-dropdown>
            <button
                type="button"
                class="nl {inAbout ? 'is-active' : ''}"
                aria-expanded={dropdown === 'about'}
                aria-controls="dd-about"
                on:click={() => toggle('about')}
            >Über uns<Icon name="chevron-down" size={16} /></button>
            {#if dropdown === 'about'}
                <div id="dd-about" class="panel right">
                    {#each about as link (link.href)}
                        <a href={link.href} class="pi" aria-current={active(link.href, path) ? 'page' : undefined}>{link.label}</a>
                    {/each}
                </div>
            {/if}
        </div>
    </nav>

    <div class="end">
        <ThemeToggle />
        <a class="round hide-m" href="/kontakt" aria-label="Kontakt" title="Kontakt"><Icon name="mail" /></a>
        <a class="pill hide-m" href="/probestunde" data-umami-event="Probestunde-Knopf" data-umami-event-ort="Navigation">Probestunde</a>
        <button
            type="button"
            class="round menu"
            data-umami-event="Menü mobil umgeschaltet"
            on:click={() => (open = !open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
        >
            <Icon name={open ? 'x' : 'menu'} />
        </button>
    </div>
</header>

{#if open}
    <nav id="mobile-menu" class="mobile" aria-label="Menü">
        <div class="site-container">
            {#each sections as section (section.label)}
                <p class="ml">{section.label}</p>
                {#each section.groups as group (group.slug)}
                    <a href={group.href} class="mi" aria-current={active(group.href, path) ? 'page' : undefined}
                        ><span class="dot" style="--g: {group.color}"></span>{group.name}</a
                    >
                {/each}
            {/each}
            <p class="ml">Stamm</p>
            {#each [...links, ...about] as link (link.href)}
                <a href={link.href} class="mi" aria-current={active(link.href, path) ? 'page' : undefined}>{link.label}</a>
            {/each}
            <p style="margin-top: 20px"><a class="pill" href="/probestunde" data-umami-event="Probestunde-Knopf" data-umami-event-ort="Menü mobil">Probestunde</a></p>
        </div>
    </nav>
{/if}

<style>
    .nav {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        height: 76px;
    }
    .mark {
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        font-weight: 600;
        font-size: 18px;
        letter-spacing: -0.01em;
        color: var(--color-ink);
        justify-self: start;
    }
    .mark img {
        width: 26px;
        height: auto;
        display: block;
    }
    .links {
        display: flex;
        gap: 28px;
        font-size: 16px;
        font-weight: 500;
        align-items: center;
    }
    .nl {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        text-decoration: none;
        padding: 6px 0;
        border: 0;
        border-bottom: 2px solid transparent;
        background: none;
        color: var(--color-ink);
        font: inherit;
        cursor: pointer;
        transition: border-color 0.15s ease;
    }
    .nl:hover,
    .nl.is-active {
        border-bottom-color: var(--color-ink);
    }
    .dd {
        position: relative;
    }
    .panel {
        position: absolute;
        left: -16px;
        top: calc(100% + 10px);
        z-index: 60;
        min-width: 260px;
        background: var(--color-subtle);
        padding: 8px;
        display: flex;
        flex-direction: column;
    }
    .panel.right {
        left: auto;
        right: -16px;
    }
    .pl {
        padding: 10px 12px 4px;
        font-size: 14px;
        font-weight: 400;
        color: var(--color-muted);
    }
    .pi {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 44px;
        padding: 0 12px;
        text-decoration: none;
        color: var(--color-ink);
    }
    .pi:hover,
    .pi[aria-current='page'] {
        background: var(--color-page);
    }
    .pi.all {
        margin-top: 6px;
        text-decoration: underline;
        text-underline-offset: 4px;
    }
    .end {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 8px;
    }
    .menu {
        display: none;
    }
    .mobile {
        background: var(--color-subtle);
        padding-block: 8px 28px;
    }
    .ml {
        margin-top: 18px;
        font-size: 14px;
        color: var(--color-muted);
    }
    .mi {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 48px;
        font-size: 18px;
        font-weight: 500;
        text-decoration: none;
        color: var(--color-ink);
    }
    .mi[aria-current='page'] {
        text-decoration: underline;
        text-underline-offset: 5px;
    }
    @media (max-width: 62rem) {
        .nav {
            grid-template-columns: 1fr auto;
            height: 64px;
        }
        .links,
        .hide-m {
            display: none;
        }
        .menu {
            display: inline-flex;
        }
    }
</style>
