<script>
    // Zwei-Klick-Karte (#31): Kacheln von tile.openstreetmap.org werden erst nach Klick auf „Karte laden“ geholt –
    // beim Seitenaufruf gehen keine Anfragen an Dritte. Die Wahl wird nicht gespeichert (kein Cookie, kein Storage).
    import { tick } from 'svelte';

    /** Höhe als Tailwind-Klasse */
    export let height = 'h-[400px]';

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

<!-- Karte -->
{#if active}
    <div bind:this={container} class="relative z-0 w-full {height} border border-line-strong" role="region" aria-label="Karte: Ev. Auferstehungsgemeinde Bremen-Hastedt"></div>
{:else}
    <div class="w-full {height} border border-line-strong bg-subtle flex items-center justify-center p-5">
        <div class="max-w-md text-center space-y-2.5">
            <button type="button" on:click={loadMap} disabled={loading}
                    class="inline-flex items-center px-4 py-2 border border-line-strong bg-surface text-ink transition-colors hover:bg-page disabled:opacity-60">
                {loading ? 'Karte wird geladen …' : 'Karte laden'}
            </button>
            <p class="text-small text-muted">
                Lädt Kartendaten von OpenStreetMap; dabei wird deine IP-Adresse übertragen
                (<a href="/datenschutz#m328" class="text-link">Datenschutz</a>).
            </p>
            {#if failed}
                <p class="border-l-4 border-alert-line bg-alert px-3 py-1.5 text-small text-ink" role="alert">Die Karte konnte nicht geladen werden.</p>
            {/if}
            <p class="text-small">
                <a href={osmLink} target="_blank" rel="noopener noreferrer" class="text-link">Auf openstreetmap.org öffnen</a>
            </p>
        </div>
    </div>
{/if}
