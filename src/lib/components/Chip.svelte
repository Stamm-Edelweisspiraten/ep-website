<script lang="ts">
    // Kleines Etikett für Gruppen und Themen: mit Farbe gefüllt (Schrift hell/dunkel nach Kontrast),
    // ohne Farbe grau umrandet. Mit `href` als Link (z. B. zur Gruppenseite).
    import { contrastTextColor } from '$lib/month-calendar';

    export let label: string;
    export let color: string | null = null;
    export let href: string | null = null;
    /** `sm` für Karten/Listen, `md` für Detailseiten */
    export let size: 'sm' | 'md' = 'sm';

    $: fg = contrastTextColor(color);
    $: style = fg ? `background-color: ${color}; border-color: ${color}; color: ${fg};` : '';
    $: cls = `inline-flex max-w-full items-center rounded-full border font-medium leading-tight ${
        size === 'md' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs'
    } ${fg ? '' : 'border-gray-300 bg-gray-50 text-gray-700'}`;
</script>

{#if href}
    <a {href} class="{cls} transition hover:brightness-95 hover:underline" {style}>
        <span class="truncate">{label}</span>
    </a>
{:else}
    <span class={cls} {style}><span class="truncate">{label}</span></span>
{/if}
