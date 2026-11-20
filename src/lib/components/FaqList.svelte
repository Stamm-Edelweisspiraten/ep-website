<script lang="ts">
    import type { SiteFaq } from '$lib/site-types';
    import Icon from '$lib/components/Icon.svelte';
    import { track, currentPath } from '$lib/track';

    /** Fragen mit serverseitig bereinigten Antworten (`lib/server/rich-text.ts`) */
    export let faqs: SiteFaq[] = [];
    /** erste Frage aufgeklappt */
    export let openFirst = false;

    let openId: string | null = openFirst ? (faqs[0]?.id ?? null) : null;

    function toggle(id: string) {
        openId = openId === id ? null : id;
        const faq = openId ? faqs.find((f) => f.id === openId) : null;
        if (faq) track('FAQ geöffnet', { frage: faq.question, seite: currentPath() });
    }
</script>

<div class="qlist">
    {#each faqs as faq (faq.id)}
        <div class="faq {openId === faq.id ? 'open' : ''}">
            <h3>
                <button
                    type="button"
                    id="faq-q-{faq.id}"
                    aria-expanded={openId === faq.id}
                    aria-controls="faq-a-{faq.id}"
                    on:click={() => toggle(faq.id)}
                >
                    <span class="ic"><Icon name="question" /></span>
                    <span class="qt">{faq.question}</span>
                    <Icon name="chevron-down" class="chev" />
                </button>
            </h3>
            <div id="faq-a-{faq.id}" role="region" aria-labelledby="faq-q-{faq.id}" class="a richtext faq-answer" hidden={openId !== faq.id}>
                <!-- serverseitig bereinigt (renderRichText) -->
                {@html faq.answerHtml}
            </div>
        </div>
    {/each}
</div>

<style>
    .qlist {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .faq {
        background: var(--color-subtle);
        transition: background 0.2s ease;
    }
    .faq:not(.open):hover {
        background: var(--color-subtle-2);
    }
    button {
        width: 100%;
        min-height: 76px;
        padding: 16px 24px 16px 16px;
        display: flex;
        align-items: center;
        gap: 16px;
        font: 500 17px/1.4 var(--font-sans);
        color: var(--color-ink);
        background: none;
        border: 0;
        text-align: left;
        cursor: pointer;
    }
    .qt {
        flex: 1;
    }
    button :global(.chev) {
        transition: transform 0.2s ease;
    }
    .open button :global(.chev) {
        transform: rotate(180deg);
    }
    .a {
        padding: 0 64px 24px 76px;
        max-width: 76ch;
    }
    @media (max-width: 50rem) {
        button {
            font-size: 16px;
        }
        .a {
            padding: 0 20px 20px 76px;
        }
    }
</style>
