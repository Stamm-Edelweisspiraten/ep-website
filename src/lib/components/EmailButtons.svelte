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
    <a href={`mailto:${email}`} class="inline-flex items-center rounded bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800">
        E-Mail senden
    </a>
    <button type="button" on:click={copyEmail} class="inline-flex items-center rounded border border-gray-400 bg-surface px-4 py-2 text-ink hover:bg-subtle">
        {copied ? 'Kopiert' : 'Adresse kopieren'}
    </button>
    {#if failed}<span class="text-sm text-muted">Kopieren nicht möglich – bitte Adresse markieren.</span>{/if}
</div>
