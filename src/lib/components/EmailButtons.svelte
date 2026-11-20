<script>
    // „E-Mail schreiben“ und „Adresse kopieren“ – für Gruppen und Ämter gleich.
    // `compact`: Adresse selbst als Mail-Link + runder Kopieren-Knopf (Kontaktseite, viele Einträge).
    import Icon from '$lib/components/Icon.svelte';

    export let email = '';
    /** auf Wolke-Flächen: Knöpfe im Seitengrund */
    export let onCloud = false;
    /** eine Zeile: Adresse als Link + kleiner Kopieren-Knopf */
    export let compact = false;
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

{#if compact}
    <div class="mrow">
        <a class="maddr" href={`mailto:${email}`}><Icon name="mail" size={16} />{email}</a>
        <button
            type="button"
            on:click={copyEmail}
            class="mcopy {onCloud ? 'on-cloud' : ''}"
            aria-label={copied ? 'Adresse kopiert' : `Adresse ${email} kopieren`}
            title={copied ? 'Kopiert' : 'Adresse kopieren'}
            aria-live="polite"><Icon name={copied ? 'check' : 'copy'} size={16} /></button
        >
    </div>
    {#if failed}<span class="cap" role="status">Kopieren nicht möglich – bitte Adresse markieren.</span>{/if}
{:else}
    <div class="acts" style="align-items: center">
        <a href={`mailto:${email}`} class="pill sm">E-Mail schreiben</a>
        <button type="button" on:click={copyEmail} class="pill sm {onCloud ? 'canvas' : 'soft'}" aria-live="polite">
            <Icon name={copied ? 'check' : 'copy'} size={16} />{copied ? 'Kopiert' : 'Adresse kopieren'}
        </button>
        {#if failed}<span class="cap" role="status">Kopieren nicht möglich – bitte Adresse markieren.</span>{/if}
    </div>
{/if}

<style>
    .mrow {
        display: flex;
        align-items: center;
        gap: 8px;
        max-width: 100%;
    }
    .maddr {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        font-size: 15px;
        font-weight: 500;
        color: var(--color-ink);
        text-decoration: underline;
        text-decoration-color: var(--color-muted);
        text-underline-offset: 4px;
        overflow-wrap: anywhere;
    }
    .maddr:hover {
        text-decoration-color: currentColor;
    }
    .maddr :global(.i) {
        flex: none;
    }
    .mcopy {
        flex: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 0;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--color-subtle);
        color: var(--color-ink);
        cursor: pointer;
    }
    .mcopy.on-cloud {
        background: var(--color-page);
    }
    .mcopy:hover {
        background: var(--color-subtle-2);
    }
</style>
