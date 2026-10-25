<script>
    // „E-Mail schreiben“ und „Adresse kopieren“ – für Gruppen und Ämter gleich.
    import Icon from '$lib/components/Icon.svelte';

    export let email = '';
    /** auf Wolke-Flächen: Knöpfe im Seitengrund */
    export let onCloud = false;
    let copied = false;
    let failed = false;

    async function copyEmail() {
        try {
            await navigator.clipboard.writeText(email);
            copied = true;
            failed = false;
            setTimeout(() => (copied = false), 2000);
        } catch {
            failed = true;
        }
    }
</script>

<div class="acts" style="align-items: center">
    <a href={`mailto:${email}`} class="pill sm">E-Mail schreiben</a>
    <button type="button" on:click={copyEmail} class="pill sm {onCloud ? 'canvas' : 'soft'}" aria-live="polite">
        <Icon name={copied ? 'check' : 'copy'} size={16} />{copied ? 'Kopiert' : 'Adresse kopieren'}
    </button>
    {#if failed}<span class="cap" role="status">Kopieren nicht möglich – bitte Adresse markieren.</span>{/if}
</div>
