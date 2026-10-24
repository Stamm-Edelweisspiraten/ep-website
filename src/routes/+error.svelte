<script lang="ts">
    // Fehlerseite: bei 503 (Backend kurz nicht erreichbar) lädt sie die Daten nach einigen Sekunden selbst neu –
    // meist ist der Aussetzer dann vorbei (Neustart beim Deployment, kurze Last).
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

<svelte:head>
    <title>{notFound ? 'Seite nicht gefunden' : 'Gerade nicht erreichbar'} – Stamm Edelweißpiraten</title>
    <meta name="robots" content="noindex" />
</svelte:head>

<section class="mx-auto max-w-2xl px-6 py-20 text-center">
    <p class="text-base font-semibold text-gray-700">Fehler {status}</p>
    {#if notFound}
        <h1 class="mt-2 text-3xl font-bold text-gray-900">Diese Seite gibt es nicht (mehr)</h1>
        <p class="mt-3 text-gray-600">
            {$page.error?.message && $page.error.message !== 'Not Found'
                ? $page.error.message
                : 'Vielleicht wurde sie verschoben oder der Link ist veraltet.'}
        </p>
    {:else if unavailable}
        <h1 class="mt-2 text-3xl font-bold text-gray-900">Gerade nicht erreichbar</h1>
        <p class="mt-3 text-gray-600">
            {($page.error?.message ?? 'Die Daten konnten gerade nicht geladen werden').replace(/\.?$/, '.')} Meist ist das nach wenigen Sekunden
            wieder vorbei.
        </p>
        <p class="mt-4 text-sm text-gray-500" aria-live="polite">
            {#if retrying}
                Wird neu geladen …
            {:else if countdown > 0}
                Neuer Versuch in {countdown} s …
            {:else}
                Bitte versuche es später noch einmal.
            {/if}
        </p>
    {:else}
        <h1 class="mt-2 text-3xl font-bold text-gray-900">Da ist etwas schiefgegangen</h1>
        <p class="mt-3 text-gray-600">{$page.error?.message ?? 'Unbekannter Fehler.'}</p>
    {/if}

    <div class="mt-8 flex flex-wrap justify-center gap-3">
        {#if unavailable}
            <button
                type="button"
                class="bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
                disabled={retrying}
                on:click={() => ((attempt = 0), retry())}
            >
                Jetzt erneut versuchen
            </button>
        {/if}
        <a href="/" class="border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 hover:bg-gray-50">Zur Startseite</a>
        <a href="/kontakt" class="border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 hover:bg-gray-50">Kontakt</a>
    </div>
</section>
