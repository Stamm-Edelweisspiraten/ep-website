<script>
    // Zwei-Klick-Karte (#31): Kacheln von tile.openstreetmap.org werden erst nach Klick auf „Karte laden“ geholt –
    // beim Seitenaufruf gehen keine Anfragen an Dritte. Die Wahl wird nicht gespeichert (kein Cookie, kein Storage).
    import { tick } from 'svelte';
    import Icon from '$lib/components/Icon.svelte';

    /** Mindesthöhe in px */
    export let height = 360;

    /** @type {HTMLDivElement | undefined} */
    let container;
    let active = false;
    let loading = false;
    let failed = false;
    const lat = 53.064289;
    const lng = 8.868496;
    const zoom = 16;
    const osmLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;

    async function loadMap() {
        if (active || loading) return;
        loading = true;
        failed = false;
        try {
            const L = await import('leaflet');
            active = true;
            await tick();
            const map = L.map(container).setView([lat, lng], zoom);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            L.marker([lat, lng])
                .addTo(map)
                .bindPopup('Ev. Auferstehungsgemeinde Bremen-Hastedt')
                .openPopup();
        } catch {
            active = false;
            failed = true;
        } finally {
            loading = false;
        }
    }
</script>

{#if active}
    <div bind:this={container} class="relative z-0 w-full" style="height: {height}px" role="region" aria-label="Karte: Ev. Auferstehungsgemeinde Bremen-Hastedt"></div>
{:else}
    <div class="mapbox" style="min-height: {height}px">
        <span class="ic" style="width: 56px; height: 56px"><Icon name="map" size={24} /></span>
        <p class="strong" style="color: var(--color-ink); font-size: 18px">Treffpunkt: Ev. Auferstehungsgemeinde</p>
        <p>
            Drakenburger Str. 42, 28207 Bremen. Die Karte lädt erst nach deinem Klick von OpenStreetMap, dabei wird deine
            IP-Adresse übertragen (<a href="/datenschutz#m328" class="text-link">Datenschutz</a>).
        </p>
        <div class="acts" style="justify-content: center">
            <button type="button" class="pill" on:click={loadMap} disabled={loading}>{loading ? 'Karte wird geladen …' : 'Karte laden'}</button>
            <a class="pill canvas" href={osmLink} target="_blank" rel="noopener noreferrer">Auf openstreetmap.org<Icon name="external" size={16} /></a>
        </div>
        {#if failed}
            <p role="alert">Die Karte konnte nicht geladen werden.</p>
        {/if}
    </div>
{/if}
