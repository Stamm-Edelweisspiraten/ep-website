<script>
    // Umschalter hell/dunkel. Die Wahl steht im Cookie `theme` (nur Darstellung, 1 Jahr), damit der Server die Seite
    // gleich richtig ausliefert. Ohne Wahl folgt die Seite der Systemeinstellung (siehe `app.html`).
    import { onMount } from 'svelte';

    let dark = false;

    onMount(() => {
        dark = document.documentElement.classList.contains('dark');
    });

    function toggle() {
        dark = !dark;
        const root = document.documentElement;
        root.classList.toggle('dark', dark);
        root.classList.toggle('light', !dark);
        const secure = location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `theme=${dark ? 'dark' : 'light'}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
    }
</script>

<button
        type="button"
        on:click={toggle}
        class="inline-flex size-10 items-center justify-center text-muted hover:text-ink transition"
        aria-label={dark ? 'Helle Darstellung' : 'Dunkle Darstellung'}
        title={dark ? 'Helle Darstellung' : 'Dunkle Darstellung'}
>
    {#if dark}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path>
        </svg>
    {:else}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"></path>
        </svg>
    {/if}
</button>
