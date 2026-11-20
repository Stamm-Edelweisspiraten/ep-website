<script>
    // Zwei-Klick-Karte (#31): Google Maps wird erst nach Klick auf „Karte laden“ eingebettet –
    // beim Seitenaufruf gehen keine Anfragen an Dritte. Die Wahl wird nicht gespeichert (kein Cookie, kein Storage).
    // Einbettung ohne API-Key über `maps.google.com/maps?…&output=embed`.
    import Icon from '$lib/components/Icon.svelte';
    import { GOOGLE_MAPS_URL, GOOGLE_PLACE_QUERY } from '$lib/seo';

    /** Mindesthöhe in px */
    export let height = 360;

    let active = false;
    // Google-Eintrag des Stammes, damit die Karte unseren Ort (mit Name) zeigt
    const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(GOOGLE_PLACE_QUERY)}&z=16&hl=de&output=embed`;
    const mapsLink = GOOGLE_MAPS_URL;
</script>

{#if active}
    <iframe
        class="gmap"
        src={embedUrl}
        style="height: {height}px"
        title="Karte: Stamm Edelweißpiraten, Drakenburger Str. 42, Bremen"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        allowfullscreen
    ></iframe>
{:else}
    <div class="mapbox" style="min-height: {height}px">
        <span class="ic" style="width: 56px; height: 56px"><Icon name="map" size={24} /></span>
        <p class="strong" style="color: var(--color-ink); font-size: 18px">Treffpunkt: Ev. Kirchengemeinde Bremen-Hastedt</p>
        <p>
            Drakenburger Str. 42, 28207 Bremen. Die Karte lädt erst nach deinem Klick von Google Maps, dabei werden deine
            IP-Adresse und Nutzungsdaten an Google übertragen (<a href="/datenschutz#m328" class="text-link">Datenschutz</a>).
        </p>
        <div class="acts" style="justify-content: center">
            <button type="button" class="pill" on:click={() => (active = true)}>Karte laden</button>
            <a class="pill canvas" href={mapsLink} target="_blank" rel="noopener noreferrer">In Google Maps öffnen<Icon name="external" size={16} /></a>
        </div>
    </div>
{/if}

<style>
    .gmap {
        display: block;
        width: 100%;
        border: 0;
    }
</style>
