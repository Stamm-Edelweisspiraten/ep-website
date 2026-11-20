<script>
    // Widerspruch gegen die Besucherstatistik (Umami): Umami zählt nicht, solange `umami.disabled` im
    // localStorage steht. Nur in diesem Browser; ohne JavaScript läuft auch die Statistik nicht.
    import { onMount } from 'svelte';

    let ready = false;
    let disabled = false;

    onMount(() => {
        try {
            disabled = !!localStorage.getItem('umami.disabled');
            ready = true;
        } catch {
            ready = false;
        }
    });

    function toggle() {
        try {
            if (disabled) localStorage.removeItem('umami.disabled');
            else localStorage.setItem('umami.disabled', '1');
            disabled = !disabled;
        } catch {
            ready = false;
        }
    }
</script>

{#if ready}
    <p class="optout" role="status">
        {disabled ? 'Dieser Browser wird nicht gezählt.' : 'Dieser Browser wird anonym gezählt.'}
        <button type="button" class="pill sm soft" on:click={toggle}>
            {disabled ? 'Statistik wieder erlauben' : 'Nicht mehr zählen'}
        </button>
    </p>
{:else}
    <p class="optout">Ohne JavaScript bzw. mit blockiertem Speicher findet keine Statistik statt.</p>
{/if}

<style>
    .optout {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
        margin-top: 12px;
    }
</style>
