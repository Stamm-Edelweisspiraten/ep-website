<script lang="ts">
    import { onMount } from 'svelte';
    import type { SiteBanner } from '$lib/site-types';

    /** Laufende Banner mit `placement: 'bar'` (aus dem Layout-Load) */
    export let banners: SiteBanner[] = [];

    /** Im Browser gemerkte, geschlossene Hinweise (`<id>:<updatedAt>`); ohne JS bleibt alles sichtbar */
    const STORAGE_KEY = 'ep:hinweise-geschlossen';
    const MAX_REMEMBERED = 50;

    let dismissed: string[] = [];

    function readDismissed(): string[] {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const list = raw ? JSON.parse(raw) : [];
            return Array.isArray(list) ? list.filter((x) => typeof x === 'string') : [];
        } catch {
            return [];
        }
    }

    onMount(() => {
        dismissed = readDismissed();
    });

    function dismiss(banner: SiteBanner) {
        dismissed = [...dismissed.filter((k) => k !== banner.dismissKey), banner.dismissKey].slice(-MAX_REMEMBERED);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed));
        } catch {
            // Speicher gesperrt (privater Modus): nur für diese Seite ausblenden
        }
    }

    $: visible = banners.filter((b) => !(b.dismissible && dismissed.includes(b.dismissKey)));
</script>

{#each visible as banner (banner.id)}
    <aside
        aria-label="Hinweis"
        class="border-b {banner.level === 'important'
            ? 'border-alert-line bg-alert'
            : 'border-notice-line bg-notice'} text-ink"
    >
        <div class="site-container flex items-start gap-4 py-2.5">
            <p class="min-w-0 flex-1 text-base leading-snug {banner.level === 'important' ? 'font-medium' : ''}">
                {#if banner.title}<strong class="font-semibold">{banner.title}:</strong>{/if}
                {banner.text}
                {#if banner.linkUrl}
                    <a
                        href={banner.linkUrl}
                        class="text-link whitespace-nowrap"
                        target={banner.linkExternal ? '_blank' : undefined}
                        rel={banner.linkExternal ? 'noopener noreferrer' : undefined}
                    >{banner.linkLabel ?? 'Mehr erfahren'}</a>
                {/if}
            </p>
            {#if banner.dismissible}
                <button
                    type="button"
                    class="-my-1.5 inline-flex size-9 shrink-0 items-center justify-center text-muted hover:text-ink"
                    aria-label="Hinweis schließen"
                    on:click={() => dismiss(banner)}
                >
                    <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            {/if}
        </div>
    </aside>
{/each}
