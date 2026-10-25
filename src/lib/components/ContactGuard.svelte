<script>
    // Spam-Schutz für Kontaktformulare (im <form> platzieren): holt beim Laden eine Proof-of-Work-Aufgabe
    // (`/kontakt/challenge`), löst sie im Hintergrund (`$lib/pow`) und legt die Lösung ins versteckte Feld `pow`.
    // Wer absendet, bevor die Lösung fertig ist, wartet kurz – das Formular geht danach von selbst ab.
    // Die Zeitfalle (frühestens 3 s nach dem Laden) und die Echtheit prüft das Backend.
    import { onDestroy, onMount } from 'svelte';
    import { solvePow } from '$lib/pow';

    /** Neue Aufgabe holen, wenn die alte älter ist (Backend: 2 h gültig) */
    const REFRESH_MS = 90 * 60_000;

    /** @type {HTMLElement | undefined} */
    let el;
    let value = '';
    /** idle | working | ready | error */
    let state = 'idle';
    let waiting = false;
    let fetchedAt = 0;
    /** @type {Promise<void> | null} */
    let running = null;
    /** @type {AbortController | null} */
    let controller = null;

    async function prepare() {
        controller?.abort();
        const current = new AbortController();
        controller = current;
        const signal = current.signal;
        state = 'working';
        value = '';
        try {
            const res = await fetch('/kontakt/challenge', { cache: 'no-store', signal });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const task = await res.json();
            fetchedAt = Date.now();
            const answer = await solvePow(task, { signal });
            if (!answer) throw new Error('keine Lösung');
            value = JSON.stringify(answer);
            state = 'ready';
        } catch {
            if (!signal.aborted) state = 'error';
        }
    }

    function ensure() {
        if (state === 'ready' && Date.now() - fetchedAt < REFRESH_MS) return Promise.resolve();
        if (!running || state === 'error' || (state === 'ready' && Date.now() - fetchedAt >= REFRESH_MS)) {
            running = prepare();
        }
        return running;
    }

    /** @param {SubmitEvent} event */
    function onSubmit(event) {
        if (state === 'ready' && Date.now() - fetchedAt < REFRESH_MS) return;
        event.preventDefault();
        if (waiting) return;
        waiting = true;
        const target = /** @type {HTMLFormElement} */ (event.currentTarget);
        const submitter = /** @type {HTMLElement | null} */ (event.submitter);
        ensure().then(() => {
            waiting = false;
            if (state === 'ready') target.requestSubmit(submitter);
        });
    }

    /** @type {HTMLFormElement | null} */
    let form = null;
    onMount(() => {
        form = el?.closest('form') ?? null;
        form?.addEventListener('submit', onSubmit);
        running = prepare();
    });
    onDestroy(() => {
        form?.removeEventListener('submit', onSubmit);
        controller?.abort();
    });
</script>

<span bind:this={el} class="guard">
    <input type="hidden" name="pow" {value} />
    {#if waiting}
        <span class="msg cap" role="status">Spam-Schutz wird geprüft … das Formular wird gleich gesendet.</span>
    {:else if state === 'error'}
        <span class="msg field-error" role="alert">
            Der Spam-Schutz konnte nicht geladen werden. Bitte versuche es später noch einmal oder schreib uns direkt an
            stafues@edelweisspiraten-bremen.de.
        </span>
    {/if}
    <noscript><span class="msg field-error">Zum Senden des Formulars wird JavaScript benötigt (Spam-Schutz). Alternativ erreichst du uns unter stafues@edelweisspiraten-bremen.de.</span></noscript>
</span>

<style>
    .guard {
        display: contents;
    }
    .msg {
        display: block;
        grid-column: 1 / -1;
    }
</style>
