<script>
    // Spenden: Geld (Spendenkonto aus `lib/donation.ts`, Fragen an die Kasse) und Sachspenden (Materialwart*in).
    import Icon from '$lib/components/Icon.svelte';
    import Seo from '$lib/components/Seo.svelte';
    import EmailButtons from '$lib/components/EmailButtons.svelte';
    import { DONATION_ACCOUNT, compactIban, formatIban } from '$lib/donation';
    import { track } from '$lib/track';

    /** @type {import('./$types').PageData} */
    export let data;

    const account = DONATION_ACCOUNT;
    const hasAccount = compactIban(account.iban).length > 0;

    /** Felder des Spendenkontos (leere weggelassen); `copy` = Text in der Zwischenablage */
    const fields = [
        { key: 'holder', label: 'Kontoinhaber', value: account.holder, copy: account.holder },
        { key: 'iban', label: 'IBAN', value: formatIban(account.iban), copy: compactIban(account.iban), mono: true },
        { key: 'bic', label: 'BIC', value: account.bic, copy: account.bic, mono: true },
        { key: 'bank', label: 'Bank', value: account.bank, copy: account.bank },
        { key: 'reference', label: 'Verwendungszweck', value: account.reference, copy: account.reference }
    ].filter((f) => f.value);
    const allText = fields.map((f) => `${f.label}: ${f.value}`).join('\n');

    /** zuletzt kopiertes Feld bzw. `all` */
    let copied = '';
    let failed = false;

    /** @param {string} key @param {string} label @param {string} text */
    async function copy(key, label, text) {
        try {
            await navigator.clipboard.writeText(text);
            track('Spende: kopiert', { was: label });
            copied = key;
            failed = false;
            setTimeout(() => (copied = ''), 2000);
        } catch {
            failed = true;
        }
    }

    /** @param {string[]} names */
    function joinNames(names) {
        if (names.length <= 1) return names.join('');
        return `${names.slice(0, -1).join(', ')} und ${names[names.length - 1]}`;
    }

    const uses = [
        { icon: /** @type {const} */ ('tent'), title: 'Fahrten und Lager', text: 'Zuschüsse, damit alle mitfahren können – auch wenn es zu Hause knapp ist.' },
        { icon: /** @type {const} */ ('flame'), title: 'Material', text: 'Zelte, Kochgeschirr, Werkzeug und alles, was draußen kaputtgeht.' },
        { icon: /** @type {const} */ ('users'), title: 'Gruppenstunden', text: 'Bastel- und Spielmaterial, Bücher und Ausrüstung für die Meuten und Sippen.' }
    ];
</script>

<Seo
    title="Spenden – Pfadfinder Stamm Edelweißpiraten Bremen"
    description="Unterstütze die Pfadfinder in Bremen-Hastedt: Geldspenden für Fahrten, Lager und Material oder Sachspenden wie Zelte und Kochgeschirr – so hilfst du dem Stamm Edelweißpiraten."
    path="/spenden"
    breadcrumbs={[{ name: 'Spenden', path: '/spenden' }]}
/>

<section class="site-container" aria-labelledby="h-spenden">
    <nav class="crumbs" aria-label="Brotkrümel"><a href="/">Start</a><Icon name="chevron-right" size={18} /><span aria-current="page">Spenden</span></nav>
    <div class="phead">
        <h1 class="display" id="h-spenden">Spenden</h1>
        <div class="side">
            <p>Unsere Gruppenleitungen arbeiten ehrenamtlich. Mit einer Spende hilfst du uns, Fahrten und Lager günstig zu halten und gutes Material zu haben – vielen Dank!</p>
        </div>
    </div>

    <div class="dgrid">
        <article class="give" aria-labelledby="h-geld">
            <span class="ic big" aria-hidden="true"><Icon name="euro" /></span>
            <h2 class="h-xl" id="h-geld">Geld spenden</h2>
            {#if hasAccount}
                <p class="lead">Überweise einfach auf unser Konto. Jeder Betrag hilft.</p>
                <dl class="acct">
                    {#each fields as f (f.key)}
                        <div>
                            <dt>{f.label}</dt>
                            <dd class="row">
                                <span class={f.mono ? 'tab mono' : ''}>{f.value}</span>
                                <button
                                    type="button"
                                    class="mcopy"
                                    on:click={() => copy(f.key, f.label, f.copy)}
                                    aria-label={copied === f.key ? `${f.label} kopiert` : `${f.label} kopieren`}
                                    title={copied === f.key ? 'Kopiert' : `${f.label} kopieren`}
                                >
                                    <Icon name={copied === f.key ? 'check' : 'copy'} size={16} />
                                </button>
                            </dd>
                        </div>
                    {/each}
                </dl>
                <button type="button" class="pill sm canvas" on:click={() => copy('all', 'alle Kontodaten', allText)}>
                    <Icon name={copied === 'all' ? 'check' : 'copy'} size={16} />{copied === 'all' ? 'Kontodaten kopiert' : 'Alle Kontodaten kopieren'}
                </button>
                <p class="sr-only" aria-live="polite">{copied ? 'In die Zwischenablage kopiert' : ''}</p>
                {#if failed}<p class="cap" role="status">Kopieren nicht möglich – bitte markieren und kopieren.</p>{/if}
                <p class="note">Eine Spendenbescheinigung können wir leider nicht garantieren. Wenn du eine brauchst, sprich uns bitte <strong>vor</strong> der Überweisung direkt an – dann klären wir das gemeinsam. Auch bei allen anderen Fragen melde dich bei: <strong>{data.treasurer.office}</strong>{#if data.treasurer.names.length} ({joinNames(data.treasurer.names)}){/if}</p>
            {:else}
                <p class="lead">Unsere Kontodaten schicken wir dir gern per Mail. Melde dich bei: <strong>{data.treasurer.office}</strong>{#if data.treasurer.names.length} ({joinNames(data.treasurer.names)}){/if}</p>
            {/if}
            <EmailButtons email={data.treasurer.email} onCloud />
        </article>

        <article class="give" aria-labelledby="h-sach">
            <span class="ic big" aria-hidden="true"><Icon name="tent" /></span>
            <h2 class="h-xl" id="h-sach">Sachen spenden</h2>
            <p class="lead">Du hast noch Ausrüstung, die du nicht mehr brauchst? Wir freuen uns zum Beispiel über:</p>
            <ul class="needs">
                <li>Zelte, Planen und Seile</li>
                <li>Kochgeschirr, Töpfe und Gaskocher</li>
                <li>Werkzeug wie Äxte, Sägen und Spaten</li>
                <li>Rucksäcke, Isomatten und Schlafsäcke</li>
                <li>Bastel- und Spielmaterial</li>
            </ul>
            <p class="note">Bitte melde dich vorher, damit wir abstimmen können, was wir gerade brauchen und wie es zu uns kommt. Ansprechpartner*in: <strong>{data.material.office}</strong>{#if data.material.names.length} ({joinNames(data.material.names)}){/if}</p>
            <EmailButtons email={data.material.email} onCloud />
        </article>
    </div>
</section>

<section class="site-container section-gap" aria-labelledby="h-wofuer">
    <h2 class="h-xl" id="h-wofuer">Wofür wir Spenden einsetzen</h2>
    <ul class="uses">
        {#each uses as u (u.title)}
            <li>
                <span class="ic" aria-hidden="true"><Icon name={u.icon} /></span>
                <h3>{u.title}</h3>
                <p>{u.text}</p>
            </li>
        {/each}
    </ul>
</section>

<style>
    .dgrid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 24px;
        margin-top: 48px;
    }
    .give {
        background: var(--color-subtle);
        padding: 32px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
    }
    .ic.big {
        background: var(--color-page);
    }
    .lead {
        font-size: 17px;
        line-height: 1.55;
        color: var(--color-body);
    }
    .note {
        font-size: 15px;
        line-height: 1.55;
        color: var(--color-body);
        margin-top: auto;
    }
    .acct {
        display: flex;
        flex-direction: column;
        gap: 4px;
        width: 100%;
    }
    .acct > div {
        background: var(--color-page);
        padding: 12px 16px;
        display: grid;
        grid-template-columns: 9.5rem minmax(0, 1fr);
        gap: 12px;
        align-items: center;
    }
    .acct dt {
        font-size: 14px;
        color: var(--color-muted);
    }
    .acct dd {
        font-size: 16px;
        font-weight: 500;
        overflow-wrap: anywhere;
    }
    .acct .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }
    .mono {
        letter-spacing: 0.02em;
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
    .mcopy:hover {
        background: var(--color-subtle-2);
    }
    .needs {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding-left: 1.2em;
        list-style: disc;
        font-size: 16px;
        color: var(--color-body);
    }
    .uses {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 24px;
        margin-top: 24px;
    }
    .uses li {
        background: var(--color-subtle);
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .uses .ic {
        background: var(--color-page);
    }
    .uses h3 {
        font-size: 18px;
        font-weight: 600;
    }
    .uses p {
        font-size: 15px;
        line-height: 1.55;
        color: var(--color-body);
    }
    @media (max-width: 50rem) {
        .dgrid,
        .uses {
            grid-template-columns: 1fr;
        }
        .give {
            padding: 24px;
        }
        .acct > div {
            grid-template-columns: 1fr;
            gap: 2px;
        }
    }
</style>
