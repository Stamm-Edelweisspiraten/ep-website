<script>
    // Zwei-Klick-Karte (#31): Kacheln von tile.openstreetmap.org werden erst nach Klick auf „Karte laden“ geholt –
    // beim Seitenaufruf gehen keine Anfragen an Dritte. Die Wahl wird nicht gespeichert (kein Cookie, kein Storage).
    import { tick } from 'svelte';

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
    <div bind:this={container} class="relative z-0 w-full h-[400px] rounded shadow"></div>
{:else}
    <div class="w-full h-[400px] rounded shadow bg-gray-100 border border-gray-200 flex items-center justify-center p-6">
        <div class="max-w-md text-center space-y-3">
            <p class="font-semibold text-gray-800">Karte: Drakenburger Str. 42, 28207 Bremen</p>
            <p class="text-sm text-gray-600">
                Die Karte wird erst nach deinem Klick von OpenStreetMap geladen. Dabei wird deine IP-Adresse an die
                OpenStreetMap Foundation übertragen. Mehr dazu in der <a href="/datenschutz#m328" class="underline">Datenschutzerklärung</a>.
            </p>
            <button type="button" on:click={loadMap} disabled={loading}
                    class="inline-flex items-center px-5 py-2.5 bg-gray-900 text-white font-medium rounded hover:bg-gray-800 transition disabled:opacity-60">
                {loading ? 'Karte wird geladen …' : 'Karte laden'}
            </button>
            {#if failed}
                <p class="text-sm text-red-700">Die Karte konnte nicht geladen werden.</p>
            {/if}
            <p class="text-sm">
                <a href={osmLink} target="_blank" rel="noopener noreferrer" class="underline text-gray-700">Auf openstreetmap.org öffnen</a>
            </p>
        </div>
    </div>
{/if}
