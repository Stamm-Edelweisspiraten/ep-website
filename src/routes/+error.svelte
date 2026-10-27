<script lang="ts">
    // Fehlerseite: bei 503 (Backend kurz nicht erreichbar) lädt sie die Daten nach einigen Sekunden selbst neu –
    // meist ist der Aussetzer dann vorbei (Neustart beim Deployment, kurze Last).
    import Seo from '$lib/components/Seo.svelte';
    import { onDestroy, onMount } from 'svelte';
    import { invalidateAll } from '$app/navigation';
    import { page } from '$app/stores';

    const RETRY_SECONDS = [5, 10, 20];

    let attempt = 0;
    let countdown = 0;
    let retrying = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    let destroyed = false;

    $: status = $page.status;
    $: unavailable = status === 503 || status === 502 || status === 504;
    $: notFound = status === 404;

    function schedule() {
        clearInterval(timer);
        const seconds = RETRY_SECONDS[attempt];
        if (seconds === undefined) {
            countdown = 0;
            return;
        }
        countdown = seconds;
        timer = setInterval(() => {
            countdown -= 1;
            if (countdown <= 0) {
                clearInterval(timer);
                attempt += 1;
                void retry();
            }
        }, 1000);
    }

    async function retry() {
        clearInterval(timer);
        retrying = true;
        await invalidateAll();
        retrying = false;
        // noch immer ein Fehler → nächster Versuch (bei Erfolg ist diese Seite schon weg)
        if (!destroyed && unavailable) schedule();
    }

    onMount(() => {
        if (unavailable) schedule();
    });

    onDestroy(() => {
        destroyed = true;
        clearInterval(timer);
    });
</script>

<Seo title={`${notFound ? 'Seite nicht gefunden' : 'Gerade nicht erreichbar'} – Stamm Edelweißpiraten`} noindex />

<section class="site-container" style="padding-block: 64px 24px">
<div style="max-width: 900px">
    <p class="cap tab strong">Fehler {status}</p>
    {#if notFound}
        <h1 class="display err-title">Diese Seite gibt es nicht (mehr)</h1>
        <p class="err-lede">
            {$page.error?.message && $page.error.message !== 'Not Found'
                ? $page.error.message
                : 'Vielleicht wurde sie verschoben oder der Link ist veraltet.'}
        </p>
    {:else if unavailable}
        <h1 class="display err-title">Gerade nicht erreichbar</h1>
        <p class="err-lede">
            {($page.error?.message ?? 'Die Daten konnten gerade nicht geladen werden').replace(/\.?$/, '.')} Meist ist das nach wenigen Sekunden
            wieder vorbei.
        </p>
        <p class="mt-4 text-small text-muted tabular-nums" aria-live="polite">
            {#if retrying}
                Wird neu geladen …
            {:else if countdown > 0}
                Neuer Versuch in {countdown} s …
            {:else}
                Bitte versuche es später noch einmal.
            {/if}
        </p>
    {:else}
        <h1 class="display err-title">Da ist etwas schiefgegangen</h1>
        <p class="err-lede">{$page.error?.message ?? 'Unbekannter Fehler.'}</p>
    {/if}

    <div class="acts" style="margin-top: 32px">
        {#if unavailable}
            <button
                type="button"
                class="pill"
                disabled={retrying}
                on:click={() => ((attempt = 0), retry())}
            >
                Jetzt erneut versuchen
            </button>
        {/if}
        <a href="/" class="pill {unavailable ? 'soft' : ''}">Zur Startseite</a>
        <a href="/termine" class="pill soft">Termine</a>
        <a href="/kontakt" class="pill soft">Kontakt</a>
    </div>
</div>
</section>

<style>
    .err-title {
        margin-top: 12px;
        font-size: clamp(56px, 8vw, 120px);
    }
    .err-lede {
        margin-top: 20px;
        font-size: 18px;
        color: var(--color-body);
        max-width: 56ch;
    }
</style>
