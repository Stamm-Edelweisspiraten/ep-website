<script lang="ts">
    import type { SiteFaq } from '$lib/site-types';

    /** Fragen mit serverseitig bereinigten Antworten (`lib/server/rich-text.ts`) */
    export let faqs: SiteFaq[] = [];

    let openId: string | null = null;

    function toggle(id: string) {
        openId = openId === id ? null : id;
    }
</script>

<div class="border-t border-line-strong">
    {#each faqs as faq (faq.id)}
        <div class="border-b border-line-strong">
            <h3>
                <button
                    type="button"
                    id="faq-q-{faq.id}"
                    class="flex min-h-11 w-full items-center justify-between gap-4 py-3.5 text-left font-semibold text-ink transition-colors hover:text-brand"
                    aria-expanded={openId === faq.id}
                    aria-controls="faq-a-{faq.id}"
                    on:click={() => toggle(faq.id)}
                >
                    {faq.question}
                    <span class="text-xl text-muted" aria-hidden="true">{openId === faq.id ? '−' : '+'}</span>
                </button>
            </h3>
            <div
                id="faq-a-{faq.id}"
                role="region"
                aria-labelledby="faq-q-{faq.id}"
                class="richtext pb-4"
                hidden={openId !== faq.id}
            >
                <!-- serverseitig bereinigt (renderRichText) -->
                {@html faq.answerHtml}
            </div>
        </div>
    {/each}
</div>
