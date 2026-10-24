<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import ThemeToggle from '$lib/components/ThemeToggle.svelte';

    /**
     * Gruppen aus dem Intern-Bereich (Layout-Load)
     * @type {import('$lib/server/backend').Group[]}
     */
    export let groups = [];

    // Meute(n) zuerst, dann Sippe(n) – wie im früheren festen Menü
    $: sections = [
        { label: 'Meute', groups: groups.filter((g) => g.type === 'meute') },
        { label: 'Sippe', groups: groups.filter((g) => g.type === 'sippe') }
    ].filter((s) => s.groups.length > 0);

    const links = [
        { href: '/termine', label: 'Termine' },
        { href: '/galerie', label: 'Galerie' },
        { href: '/team', label: 'Unser Team' },
        { href: '/cpd', label: 'CPD' },
        { href: '/kontakt', label: 'Kontakt' }
    ];

    let open = false;
    let gruppenOpen = false;

    $: path = $page.url.pathname;
    $: inGroups = path.startsWith('/meute') || path.startsWith('/sippe');
    /** @param {string} href */
    const active = (href) => path === href || path.startsWith(`${href}/`);

    // Menüs nach dem Seitenwechsel schließen
    $: path, (open = false), (gruppenOpen = false);

    /** @param {MouseEvent} event */
    function handleClickOutside(event) {
        const dropdown = document.getElementById('gruppen-dropdown');
        const button = document.getElementById('gruppen-button');
        const target = /** @type {Node} */ (event.target);
        if (dropdown && !dropdown.contains(target) && button && !button.contains(target)) {
            gruppenOpen = false;
        }
    }

    /** @param {KeyboardEvent} event */
    function handleKey(event) {
        if (event.key === 'Escape') gruppenOpen = false;
    }

    onMount(() => {
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    });
</script>

<svelte:window on:keydown={handleKey} />

<nav class="sticky top-0 z-50 border-b border-line bg-page" aria-label="Hauptmenü">
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <a href="/" class="text-xl font-extrabold text-brand">Edelweißpiraten</a>

        <!-- Desktop -->
        <div class="hidden items-center gap-6 md:flex">
            <div class="relative">
                <button
                        id="gruppen-button"
                        type="button"
                        class="nav-link flex items-center gap-1 {inGroups ? 'is-active' : ''}"
                        aria-expanded={gruppenOpen}
                        aria-controls="gruppen-dropdown"
                        on:click={() => (gruppenOpen = !gruppenOpen)}
                >
                    Gruppen
                    <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {#if gruppenOpen}
                    <div id="gruppen-dropdown" class="absolute left-0 top-full z-50 mt-2 w-64 border border-line-strong bg-surface py-2">
                        {#each sections as section, i (section.label)}
                            <p class="px-4 pb-1 text-sm text-muted {i > 0 ? 'mt-2 border-t border-line pt-3' : 'pt-1'}">{section.label}</p>
                            {#each section.groups as group (group.slug)}
                                <a href={group.href} class="block px-4 py-2 text-ink hover:bg-subtle">{group.name}</a>
                            {/each}
                        {/each}
                        {#if sections.length === 0}
                            <p class="px-4 py-2 text-sm text-muted">Die Gruppen konnten gerade nicht geladen werden.</p>
                        {/if}
                    </div>
                {/if}
            </div>

            {#each links as link (link.href)}
                <a href={link.href} class="nav-link {active(link.href) ? 'is-active' : ''}" aria-current={active(link.href) ? 'page' : undefined}>{link.label}</a>
            {/each}
            <ThemeToggle />
        </div>

        <!-- Mobil -->
        <div class="flex items-center md:hidden">
            <ThemeToggle />
            <button
                    type="button"
                    on:click={() => (open = !open)}
                    class="inline-flex size-11 items-center justify-center text-body"
                    aria-expanded={open}
                    aria-controls="mobile-menu"
                    aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
            >
                <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
            </button>
        </div>
    </div>

    {#if open}
        <div id="mobile-menu" class="border-t border-line bg-page px-4 pb-4 md:hidden">
            {#each sections as section (section.label)}
                <p class="mt-4 text-sm text-muted">{section.label}</p>
                {#each section.groups as group (group.slug)}
                    <a href={group.href} class="mobile-link">{group.name}</a>
                {/each}
            {/each}
            <div class="mt-4 border-t border-line pt-2">
                {#each links as link (link.href)}
                    <a href={link.href} class="mobile-link" aria-current={active(link.href) ? 'page' : undefined}>{link.label}</a>
                {/each}
            </div>
        </div>
    {/if}
</nav>

<style>
    .nav-link {
        color: var(--color-body);
        padding: 0.5rem 0;
    }
    .nav-link:hover {
        color: var(--color-link);
    }
    .nav-link.is-active {
        color: var(--color-ink);
        font-weight: 600;
    }
    .mobile-link {
        display: block;
        padding: 0.6rem 0;
        font-size: 1.0625rem;
        color: var(--color-ink);
    }
</style>
