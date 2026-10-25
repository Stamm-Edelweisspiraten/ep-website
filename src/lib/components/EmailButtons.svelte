<script>
    // „E-Mail senden“ und „Adresse kopieren“ – schlicht, für Gruppen und Ämter gleich.
    export let email = '';
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

<div class="mt-3 flex flex-wrap items-center gap-3">
    <a href={`mailto:${email}`} class="inline-flex items-center bg-ink px-4 py-2 font-medium text-page transition-colors hover:bg-body">
        E-Mail senden
    </a>
    <button type="button" on:click={copyEmail} class="inline-flex items-center border border-line-strong bg-surface px-4 py-2 text-ink transition-colors hover:bg-subtle">
        {copied ? 'Kopiert' : 'Adresse kopieren'}
    </button>
    {#if failed}<span class="text-small text-muted" role="status">Kopieren nicht möglich – bitte Adresse markieren.</span>{/if}
</div>
