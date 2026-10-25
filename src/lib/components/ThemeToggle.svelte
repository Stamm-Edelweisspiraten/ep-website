<script>
    // Umschalter hell/dunkel. Die Wahl steht im Cookie `theme` (nur Darstellung, 1 Jahr), damit der Server die Seite
    // gleich richtig ausliefert. Ohne Wahl folgt die Seite der Systemeinstellung (siehe `app.html`).
    import { onMount } from 'svelte';
    import Icon from '$lib/components/Icon.svelte';

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
    class="round"
    aria-label={dark ? 'Helles Design' : 'Dunkles Design'}
    title={dark ? 'Helles Design' : 'Dunkles Design'}
>
    <Icon name={dark ? 'sun' : 'moon'} />
</button>
