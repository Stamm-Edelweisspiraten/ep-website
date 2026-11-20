<script>
    // Automatische Ereignisse für die Besucherstatistik (Umami), nur wenn Umami eingerichtet ist:
    // externe Links (nur Ziel-Domain), E-Mail- und Telefon-Links (ohne Adresse/Nummer), Downloads,
    // Scrolltiefe (25/50/75/100 % je Seitenaufruf), Druck, Rückkehr zum Tab nach längerer Zeit.
    // Regeln und Hilfen in `lib/track.ts` – nie Eingaben oder personenbezogene Daten.
    import { onMount } from 'svelte';
    import { afterNavigate } from '$app/navigation';
    import { track, currentPath } from '$lib/track';

    const DOWNLOAD_RE = /\.(pdf|docx?|xlsx?|pptx?|odt|ods|zip|ics|jpe?g|png|avif|webp|mp3|mp4)$/i;
    const MARKS = [25, 50, 75, 100];
    /** @type {Set<number>} */
    let reached = new Set();
    let hiddenAt = 0;

    afterNavigate(() => {
        reached = new Set();
    });

    /** @param {MouseEvent} event */
    function onClick(event) {
        const target = /** @type {Element | null} */ (event.target);
        const a = target?.closest?.('a[href]');
        if (!a || a.hasAttribute('data-umami-event')) return; // eigene Ereignisse haben Vorrang
        const href = a.getAttribute('href') ?? '';
        const seite = currentPath();
        if (href.startsWith('mailto:')) return track('E-Mail-Link', { seite });
        if (href.startsWith('tel:')) return track('Telefon-Link', { seite });
        if (href.startsWith('webcal:')) return track('Kalender abonnieren', { art: 'App', seite });
        let url;
        try {
            url = new URL(href, location.href);
        } catch {
            return;
        }
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
        if (url.origin !== location.origin) {
            return track('Externer Link', { ziel: url.hostname.replace(/^www\./, ''), seite });
        }
        if (DOWNLOAD_RE.test(url.pathname) || a.hasAttribute('download')) {
            return track('Download', { datei: url.pathname, seite });
        }
    }

    function onScroll() {
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        if (max < 200) return; // kurze Seiten nicht messen
        const pct = Math.round((window.scrollY / max) * 100);
        for (const mark of MARKS) {
            if (pct >= mark && !reached.has(mark)) {
                reached.add(mark);
                track('Scrolltiefe', { prozent: mark, seite: currentPath() });
            }
        }
    }

    function onVisibility() {
        if (document.visibilityState === 'hidden') hiddenAt = Date.now();
        else if (hiddenAt && Date.now() - hiddenAt > 5 * 60_000) track('Zurück auf der Seite', { seite: currentPath() });
    }

    onMount(() => {
        let ticking = false;
        const scroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                ticking = false;
                onScroll();
            });
        };
        const print = () => track('Seite gedruckt', { seite: currentPath() });
        document.addEventListener('click', onClick, { capture: true });
        window.addEventListener('scroll', scroll, { passive: true });
        document.addEventListener('visibilitychange', onVisibility);
        window.addEventListener('beforeprint', print);
        return () => {
            document.removeEventListener('click', onClick, { capture: true });
            window.removeEventListener('scroll', scroll);
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('beforeprint', print);
        };
    });
</script>
