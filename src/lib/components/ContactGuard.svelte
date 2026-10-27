<script>
    // Spam-Schutz für Kontaktformulare (im <form> platzieren): holt eine Proof-of-Work-Aufgabe (`/kontakt/challenge`),
    // löst sie im Hintergrund (`$lib/pow`) und legt die Lösung ins versteckte Feld `pow`.
    // Die Aufgabe wird erst geholt, wenn das Formular in Sichtweite kommt (IntersectionObserver, 200 px Vorlauf) oder
    // jemand hineinklickt/-tabbt – Seitenaufrufe ohne Formular kosten so weder Anfrage noch Rechenzeit.
    // Wer absendet, bevor die Lösung fertig ist, wartet kurz – das Formular geht danach von selbst ab.
    // Die Zeitfalle (frühestens 3 s nach Ausstellung der Aufgabe) und die Echtheit prüft das Backend; deshalb wartet das
    // Absenden notfalls, bis die Aufgabe alt genug ist.
    import { onDestroy, onMount } from 'svelte';
    import { solvePow } from '$lib/pow';

    /** Neue Aufgabe holen, wenn die alte älter ist (Backend: 2 h gültig) */
    const REFRESH_MS = 90 * 60_000;
    /** Zeitfalle des Backends (3 s) plus Reserve */
    const MIN_AGE_MS = 3_500;

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

    /** Lösung fertig, nicht zu alt und alt genug für die Zeitfalle */
    function sendable() {
        const age = Date.now() - fetchedAt;
        return state === 'ready' && age < REFRESH_MS && age >= MIN_AGE_MS;
    }

    /** @param {SubmitEvent} event */
    function onSubmit(event) {
        if (sendable()) return;
        event.preventDefault();
        if (waiting) return;
        waiting = true;
        const target = /** @type {HTMLFormElement} */ (event.currentTarget);
        const submitter = /** @type {HTMLElement | null} */ (event.submitter);
        ensure()
            .then(async () => {
                const rest = fetchedAt + MIN_AGE_MS - Date.now();
                if (state === 'ready' && rest > 0) await new Promise((r) => setTimeout(r, rest));
            })
            .then(() => {
                waiting = false;
                if (!destroyed && sendable()) target.requestSubmit(submitter);
            });
    }

    /** Aufgabe holen, sobald sich jemand für das Formular interessiert (nur einmal anstoßen) */
    function warmUp() {
        observer?.disconnect();
        observer = null;
        if (state === 'idle') ensure();
    }

    /** @type {HTMLFormElement | null} */
    let form = null;
    /** @type {IntersectionObserver | null} */
    let observer = null;
    let destroyed = false;
    onMount(() => {
        form = el?.closest('form') ?? null;
        if (!form) return;
        form.addEventListener('submit', onSubmit);
        form.addEventListener('focusin', warmUp);
        form.addEventListener('pointerdown', warmUp);
        if (typeof IntersectionObserver === 'function') {
            observer = new IntersectionObserver(
                (entries) => {
                    if (entries.some((e) => e.isIntersecting)) warmUp();
                },
                { rootMargin: '200px 0px' }
            );
            observer.observe(form);
        } else {
            warmUp();
        }
    });
    onDestroy(() => {
        destroyed = true;
        observer?.disconnect();
        form?.removeEventListener('submit', onSubmit);
        form?.removeEventListener('focusin', warmUp);
        form?.removeEventListener('pointerdown', warmUp);
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
