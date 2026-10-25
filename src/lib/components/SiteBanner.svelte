<script lang="ts">
    import { onMount } from 'svelte';
    import type { SiteBanner } from '$lib/site-types';
    import Icon from '$lib/components/Icon.svelte';

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
    <aside aria-label="Hinweis" class="bar {banner.level === 'important' ? 'important' : ''}">
        <p>
            <Icon name={banner.level === 'important' ? 'alert' : 'info'} size={18} class="bi" />
            {#if banner.title}<strong>{banner.title}:</strong>{/if}
            <span>{banner.text}</span>
            {#if banner.linkUrl}
                <a
                    href={banner.linkUrl}
                    target={banner.linkExternal ? '_blank' : undefined}
                    rel={banner.linkExternal ? 'noopener noreferrer' : undefined}
                >{banner.linkLabel ?? 'Mehr erfahren'}</a>
            {/if}
        </p>
        {#if banner.dismissible}
            <button type="button" class="close" aria-label="Hinweis schließen" on:click={() => dismiss(banner)}>
                <Icon name="x" size={18} />
            </button>
        {/if}
    </aside>
{/each}

<style>
    .bar {
        position: relative;
        background: var(--color-subtle);
        color: var(--color-ink);
        font-size: 15px;
        line-height: 1.45;
        padding: 10px 56px;
        text-align: center;
    }
    .bar.important {
        background: var(--color-ink);
        color: var(--color-on-ink);
    }
    .bar :global(.bi) {
        display: inline-block;
        vertical-align: -3px;
        margin-right: 6px;
    }
    strong {
        font-weight: 600;
    }
    a {
        font-weight: 500;
        margin-left: 8px;
        white-space: nowrap;
        text-decoration: underline;
        text-underline-offset: 3px;
    }
    .close {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        width: 40px;
        height: 40px;
        border: 0;
        border-radius: 50%;
        background: transparent;
        color: inherit;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
    .close:hover {
        background: rgba(127, 127, 127, 0.15);
    }
    @media (max-width: 50rem) {
        .bar {
            font-size: 14px;
            padding: 10px 52px 10px 16px;
            text-align: left;
        }
    }
</style>
