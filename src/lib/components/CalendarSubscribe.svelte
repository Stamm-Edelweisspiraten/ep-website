<script>
    // „Kalender abonnieren“: webcal-Link (öffnet Kalender-App), Google Kalender und Adresse zum Kopieren.
    import { page } from '$app/stores';
    import Icon from '$lib/components/Icon.svelte';

    /** Slug der Gruppe für ein Gruppen-Abo; leer = alle besonderen Termine */
    export let groupSlug = '';
    /** Beschriftung, z. B. „Termine der Meute abonnieren“ */
    export let label = 'Kalender abonnieren';

    let copied = false;
    let failed = false;

    $: path = `/termine.ics${groupSlug ? `?gruppe=${encodeURIComponent(groupSlug)}` : ''}`;
    $: httpsUrl = `${$page.url.origin}${path}`;
    $: webcalUrl = httpsUrl.replace(/^https?:/, 'webcal:');
    $: googleUrl = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcalUrl)}`;
    $: scope = groupSlug || 'alle';

    async function copy() {
        try {
            await navigator.clipboard.writeText(httpsUrl);
            copied = true;
            failed = false;
            setTimeout(() => (copied = false), 2000);
        } catch {
            failed = true;
        }
    }
</script>

<div class="calsub">
    <a class="pill soft sm" href={webcalUrl} data-umami-event="Kalender abonnieren" data-umami-event-art="App" data-umami-event-kalender={scope}
        ><Icon name="calendar" size={16} />{label}</a
    >
    <a
        class="pill soft sm"
        href={googleUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-umami-event="Kalender abonnieren"
        data-umami-event-art="Google"
        data-umami-event-kalender={scope}>Google Kalender<Icon name="external" size={16} /><span class="sr-only"> (neues Fenster)</span></a
    >
    <button
        type="button"
        class="pill soft sm"
        on:click={copy}
        aria-live="polite"
        data-umami-event="Kalender abonnieren"
        data-umami-event-art="Adresse kopiert"
        data-umami-event-kalender={scope}><Icon name={copied ? 'check' : 'copy'} size={16} />{copied ? 'Kopiert' : 'Adresse kopieren'}</button
    >
    {#if failed}<span class="cap" role="status">Kopieren nicht möglich: {httpsUrl}</span>{/if}
</div>

<style>
    .calsub {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
    }
</style>
