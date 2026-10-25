<script lang="ts">
    import FaqList from '$lib/components/FaqList.svelte';
    import Icon from '$lib/components/Icon.svelte';
    import type { PageData } from './$types';

    export let data: PageData;

    let q = '';
    const fold = (t: string) =>
        t.toLocaleLowerCase('de-DE').replace(/ß/g, 'ss').normalize('NFD').replace(/[̀-ͯ]/g, '');
    /** Antwort ohne Tags für die Suche */
    const plain = (html: string) => html.replace(/<[^>]*>/g, ' ');
    $: words = fold(q).split(/\s+/).filter(Boolean);
    $: shown = data.faqs.filter((f) => words.every((w) => fold(`${f.question} ${plain(f.answerHtml)}`).includes(w)));
</script>

<svelte:head>
    <title>Häufige Fragen – Stamm Edelweißpiraten</title>
    <meta name="description" content="Antworten auf häufige Fragen zu Gruppenstunden, Alter, Kosten und Ausrüstung beim Stamm Edelweißpiraten." />
</svelte:head>

<section class="site-container" aria-labelledby="h-faq">
    <nav class="crumbs" aria-label="Brotkrümel"><a href="/">Start</a><Icon name="chevron-right" size={18} /><span aria-current="page">Häufige Fragen</span></nav>
    <div class="phead">
        <h1 class="display" id="h-faq">Häufige<br />Fragen</h1>
        <div class="side">
            <p>Was Eltern und Kinder vor der ersten Gruppenstunde am häufigsten wissen wollen. Deine Frage ist nicht dabei? Schreib uns.</p>
        </div>
    </div>

    <div class="faqwrap">
        <div class="main">
            {#if data.faqs.length > 4}
                <label class="search">
                    <span class="sr-only">Fragen durchsuchen</span>
                    <Icon name="search" />
                    <input type="search" bind:value={q} class="field" placeholder="Fragen durchsuchen, z. B. Beitrag oder Alter" autocomplete="off" />
                </label>
                <p class="cap" aria-live="polite">{shown.length === 1 ? '1 Frage' : `${shown.length} Fragen`}</p>
            {/if}
            {#if data.faqs.length === 0}
                <p class="empty">Gerade sind hier keine Fragen eingetragen.</p>
            {:else if shown.length === 0}
                <div class="empty nohit">
                    <p>Dazu haben wir noch keine Antwort. Schreib uns, dann melden wir uns per E-Mail.</p>
                    <a class="pill" href="/kontakt">Frage stellen</a>
                </div>
            {:else}
                {#key words.join(' ')}
                    <FaqList faqs={shown} />
                {/key}
            {/if}
        </div>

        <aside aria-label="Kurz und knapp">
            <div class="quick">
                <h2>Auf einen Blick</h2>
                <dl>
                    <div><dt>Alter</dt><dd>ab 6 Jahren</dd></div>
                    <div><dt>Probestunde</dt><dd>kostenlos</dd></div>
                    <div><dt>Jahresbeitrag</dt><dd>47 €</dd></div>
                    <div><dt>Treffpunkt</dt><dd>Drakenburger Str. 42</dd></div>
                </dl>
            </div>
            <div class="abox">
                <span class="ic" style="width: 48px; height: 48px"><Icon name="question" /></span>
                <h2>Deine Frage ist nicht dabei?</h2>
                <p>Schreib uns. Die Gruppenleitung antwortet dir per E-Mail.</p>
                <a class="pill" href="/kontakt">Frage stellen</a>
            </div>
        </aside>
    </div>
</section>

<style>
    .faqwrap {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 24px;
        align-items: start;
        margin-top: 48px;
    }
    .main {
        grid-column: 1 / span 8;
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-width: 0;
    }
    aside {
        grid-column: 10 / span 3;
        position: sticky;
        top: 24px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .search {
        position: relative;
    }
    .search :global(svg) {
        position: absolute;
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--color-muted);
    }
    .search .field {
        border-radius: 30px;
        padding-left: 52px;
        min-height: 56px;
        font-size: 17px;
    }
    .nohit {
        display: flex;
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
    }
    .quick {
        background: var(--color-subtle);
        padding: 22px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .quick h2 {
        font-size: 15px;
        font-weight: 600;
    }
    .quick dl {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .quick dl > div {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        background: var(--color-page);
        padding: 12px 14px;
        font-size: 15px;
    }
    .quick dt {
        color: var(--color-muted);
    }
    .quick dd {
        font-weight: 500;
        text-align: right;
    }
    @media (max-width: 50rem) {
        .faqwrap {
            margin-top: 32px;
        }
        .main,
        aside {
            grid-column: 1 / -1;
            position: static;
        }
    }
</style>
