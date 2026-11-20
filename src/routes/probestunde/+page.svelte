
<script>
    import { page } from '$app/stores';
    import Icon from '$lib/components/Icon.svelte';
    import ContactGuard from '$lib/components/ContactGuard.svelte';
    import Seo from '$lib/components/Seo.svelte';
    import { onMount } from 'svelte';
    import { fieldNames, track, trackWhenReady } from '$lib/track';
    import { groupsForAge } from '$lib/age-range';

    export let data;
    /** Ergebnis der Form-Action (`+page.server.ts`): Fehlertext, Feldfehler, eingegebene Werte */
    export let form;

    /** @type {Partial<Record<'childName' | 'childAge' | 'name' | 'email' | 'phone' | 'message' | 'consent', string>>} */
    let errors = {};
    $: errors = form?.errors ?? {};
    $: values = form?.values ?? null;
    $: sent = $page?.url?.searchParams?.get('success') === '1';

    /** @type {import('$lib/server/backend').Group[]} */
    $: groups = data.groups ?? [];
    const initialSlug = $page?.url?.searchParams?.get('gruppe') ?? '';

    let ageText = form?.values && Number.isFinite(form.values.childAge) ? String(form.values.childAge) : '';
    /** gewählte Gruppe (Slug) – leer = „passend zum Alter“ */
    let chosen = form?.values?.groupSlug || ((data.groups ?? []).some((/** @type {{ slug: string }} */ g) => g.slug === initialSlug) ? initialSlug : '');
    /** von Hand gewählt (dann folgt die Auswahl nicht mehr dem Alter) */
    let manual = !!chosen;

    $: age = /^\d{1,2}$/.test(ageText.trim()) ? Number(ageText.trim()) : NaN;
    $: match = Number.isFinite(age) ? groupsForAge(groups, age) : { groups: [], exact: false };
    $: if (!manual) chosen = match.groups[0]?.slug ?? '';
    $: selected = groups.find((g) => g.slug === chosen) ?? null;
    $: fits = selected ? match.groups.some((g) => g.slug === selected.slug) && match.exact : false;

    /** @param {string} slug */
    function pick(slug) {
        if (chosen === slug && manual) {
            manual = false;
            chosen = match.groups[0]?.slug ?? '';
            return;
        }
        chosen = slug;
        manual = true;
    }

    $: sentGroup = groups.find((g) => g.slug === $page?.url?.searchParams?.get('gruppe')) ?? null;

    // Statistik: Erfolg, Fehler (nur Feldnamen) und Formularbeginn – nie Inhalte
    onMount(() => {
        if (sent) trackWhenReady('Probestunde angefragt', { gruppe: sentGroup?.slug ?? 'keine' });
        else if (form?.errors || form?.error) trackWhenReady('Formularfehler', { formular: 'Probestunde', felder: fieldNames(form?.errors) || 'allgemein' });
    });
    let started = false;
    function onStart() {
        if (started) return;
        started = true;
        track('Formular begonnen', { formular: 'Probestunde' });
    }
</script>

<Seo
    title="Probestunde bei den Pfadfindern in Bremen – Stamm Edelweißpiraten"
    description="Pfadfinder ausprobieren: Melde dein Kind zu einer kostenlosen Probestunde beim Stamm Edelweißpiraten in Bremen-Hastedt (Hemelingen) an. Wir finden die passende Gruppe zum Alter."
    path="/probestunde"
    breadcrumbs={[{ name: 'Probestunde', path: '/probestunde' }]}
/>

<section class="site-container" aria-labelledby="h-probe">
    <nav class="crumbs" aria-label="Brotkrümel"><a href="/">Start</a><Icon name="chevron-right" size={18} /><span aria-current="page">Probestunde</span></nav>
    <div class="phead">
        <h1 class="display" id="h-probe">Probestunde</h1>
        <div class="side">
            <p>Dein Kind möchte die Pfadfinder kennenlernen? Sag uns, wie alt es ist – wir schicken die Anfrage an die passende Gruppe, und die Gruppenleitung meldet sich bei dir.</p>
        </div>
    </div>

    <div class="pgrid">
        <div class="formbox" id="anfrage">
            {#if sent}
                <div class="done" role="status">
                    <span class="ok"><Icon name="check" size={24} /></span>
                    <h2 class="h-xl">Danke für deine Anfrage</h2>
                    {#if sentGroup}
                        <p>Sie ist bei der Gruppenleitung der {sentGroup.typeLabel} <strong>{sentGroup.name}</strong> angekommen. Wir melden uns so schnell wie möglich per E-Mail oder Telefon.</p>
                    {:else}
                        <p>Sie ist bei uns angekommen. Wir suchen die passende Gruppe und melden uns so schnell wie möglich per E-Mail oder Telefon.</p>
                    {/if}
                    <div class="acts">
                        {#if sentGroup}<a class="pill" href={sentGroup.href}>Mehr über die {sentGroup.typeLabel}<Icon name="arrow-right" size={18} /></a>{/if}
                        <a class="pill canvas" href="/probestunde">Weiteres Kind anmelden</a>
                    </div>
                </div>
            {:else}
                {#if form?.error}
                    <p class="err" role="alert"><Icon name="alert" />{form.error}</p>
                {/if}

                <form method="POST" aria-labelledby="h-kind" class="rr-block" on:focusin={onStart} on:submit={() => track('Formular abgeschickt', { formular: 'Probestunde', gruppe: chosen || 'keine', vorschlag: fits })}>
                    <!-- Honeypot (Anti-Spam): für Menschen unsichtbar -->
                    <div class="hp" aria-hidden="true">
                        <label>Website <input type="text" name="website" tabindex="-1" autocomplete="off" /></label>
                        <label>Bitte leer lassen <input type="text" name="fax" tabindex="-1" autocomplete="off" /></label>
                    </div>

                    <h2 class="h-xl full" id="h-kind"><span class="num">1</span>Das Kind</h2>
                    <div class="fld">
                        <label for="trial-child" class="label">Name des Kindes</label>
                        <input id="trial-child" name="childName" type="text" required maxlength="100" value={values?.childName ?? ''}
                               autocomplete="off" aria-invalid={errors.childName ? 'true' : undefined}
                               aria-describedby={errors.childName ? 'trial-child-error' : undefined} class="field" />
                        {#if errors.childName}<p id="trial-child-error" class="field-error" role="alert">{errors.childName}</p>{/if}
                    </div>
                    <div class="fld">
                        <label for="trial-age" class="label">Alter</label>
                        <div class="agebox">
                            <input id="trial-age" name="childAge" type="text" inputmode="numeric" pattern="[0-9]*" required maxlength="2"
                                   bind:value={ageText} aria-invalid={errors.childAge ? 'true' : undefined}
                                   aria-describedby={errors.childAge ? 'trial-age-error' : 'trial-age-unit'} class="field" />
                            <span class="unit" id="trial-age-unit">Jahre</span>
                        </div>
                        {#if errors.childAge}<p id="trial-age-error" class="field-error" role="alert">{errors.childAge}</p>{/if}
                    </div>

                    {#if groups.length}
                        <fieldset class="full groups">
                            <legend class="label">Gruppe</legend>
                            <input type="hidden" name="group" value={manual ? chosen : ''} />
                            <div class="chips">
                                {#each groups as g (g.slug)}
                                    <button type="button" class="chip" aria-pressed={chosen === g.slug} data-umami-event="Probestunde: Gruppe gewählt" data-umami-event-gruppe={g.slug} on:click={() => pick(g.slug)}>
                                        <span class="dot" style="--g: {g.color}"></span>{g.typeLabel} {g.name}{#if g.ageRange}<span class="n">{g.ageRange}</span>{/if}
                                    </button>
                                {/each}
                            </div>
                            <p class="cap hint" aria-live="polite">
                                {#if selected && !manual && fits}
                                    <Icon name="check" size={16} />Passt zum Alter. Du kannst auch eine andere Gruppe wählen.
                                {:else if selected && !manual}
                                    <Icon name="info" size={16} />Am nächsten am Alter. Die Gruppenleitung schaut, was passt.
                                {:else if selected && manual && Number.isFinite(age) && !fits}
                                    <Icon name="info" size={16} />Laut Altersangabe{selected.ageRange ? ` (${selected.ageRange})` : ''} passt die Gruppe nicht ganz – wir leiten die Anfrage trotzdem dorthin.
                                {:else if selected && manual}
                                    <Icon name="check" size={16} />Von dir gewählt. Erneut tippen, um die Auswahl nach Alter zu nutzen.
                                {:else}
                                    Gib das Alter ein – wir schlagen die passende Gruppe vor.
                                {/if}
                            </p>
                        </fieldset>
                    {/if}

                    <h2 class="h-xl full step2" id="h-kontakt"><span class="num">2</span>Deine Kontaktdaten</h2>
                    <div class="fld full">
                        <label for="trial-name" class="label">Dein Name</label>
                        <input id="trial-name" name="name" type="text" required maxlength="100" value={values?.name ?? ''}
                               autocomplete="name" aria-invalid={errors.name ? 'true' : undefined}
                               aria-describedby={errors.name ? 'trial-name-error' : undefined} class="field" />
                        {#if errors.name}<p id="trial-name-error" class="field-error" role="alert">{errors.name}</p>{/if}
                    </div>
                    <div class="fld">
                        <label for="trial-email" class="label">E-Mail</label>
                        <input id="trial-email" name="email" type="email" required maxlength="254" value={values?.email ?? ''}
                               autocomplete="email" aria-invalid={errors.email ? 'true' : undefined}
                               aria-describedby={errors.email ? 'trial-email-error' : undefined} class="field" />
                        {#if errors.email}<p id="trial-email-error" class="field-error" role="alert">{errors.email}</p>{/if}
                    </div>
                    <div class="fld">
                        <label for="trial-phone" class="label">Telefon</label>
                        <input id="trial-phone" name="phone" type="tel" required maxlength="40" value={values?.phone ?? ''}
                               autocomplete="tel" aria-invalid={errors.phone ? 'true' : undefined}
                               aria-describedby={errors.phone ? 'trial-phone-error' : undefined} class="field" />
                        {#if errors.phone}<p id="trial-phone-error" class="field-error" role="alert">{errors.phone}</p>{/if}
                    </div>
                    <div class="fld full">
                        <label for="trial-message" class="label">Nachricht <span class="opt">(freiwillig)</span></label>
                        <textarea id="trial-message" name="message" rows="4" maxlength="2000" placeholder="z. B. Wunschtermin, Fragen oder was wir wissen sollten"
                                  aria-invalid={errors.message ? 'true' : undefined}
                                  aria-describedby={errors.message ? 'trial-message-error' : undefined} class="field">{values?.message ?? ''}</textarea>
                        {#if errors.message}<p id="trial-message-error" class="field-error" role="alert">{errors.message}</p>{/if}
                    </div>
                    <div class="full">
                        <div class="consent">
                            <input id="trial-consent" name="consent" type="checkbox" required
                                   aria-invalid={errors.consent ? 'true' : undefined}
                                   aria-describedby={errors.consent ? 'trial-consent-error' : undefined} />
                            <label for="trial-consent">
                                Ich habe die <a href="/datenschutz#m182" class="text-link">Hinweise zum Datenschutz</a> gelesen und bin einverstanden, dass die Angaben zur Vereinbarung der Probestunde an die Gruppenleitung weitergegeben und verarbeitet werden.
                            </label>
                        </div>
                        {#if errors.consent}<p id="trial-consent-error" class="field-error" role="alert">{errors.consent}</p>{/if}
                    </div>
                    <ContactGuard />
                    <div class="formfoot full">
                        <p class="cap">Alle Felder außer der Nachricht sind Pflicht.</p>
                        <button type="submit" class="pill"><Icon name="send" size={18} />Probestunde anfragen</button>
                    </div>
                </form>
            {/if}
        </div>

        <aside class="info" aria-labelledby="h-ablauf">
            {#if selected && !sent}
                <div class="gbox">
                    <p class="kick"><span class="tag on-cloud"><span class="dot" style="--g: {selected.color}"></span><span>{selected.typeLabel}</span></span>{#if selected.ageRange}<span class="cap">{selected.ageRange}</span>{/if}</p>
                    <h2 class="h-xl">{selected.name}</h2>
                    <dl>
                        {#if selected.weekday || selected.time}
                            <div><dt><Icon name="clock" size={18} /></dt><dd>{[selected.weekday, selected.time].filter(Boolean).join(', ')}</dd></div>
                        {/if}
                        {#if selected.meetingPlace}
                            <div><dt><Icon name="map-pin" size={18} /></dt><dd>{selected.meetingPlace}</dd></div>
                        {/if}
                        {#if selected.leaders}
                            <div><dt><Icon name="users" size={18} /></dt><dd>Gruppenleitung: {selected.leaders}</dd></div>
                        {/if}
                    </dl>
                    <a class="ulink" href={selected.href}>Zur Gruppe</a>
                </div>
            {/if}
            <div class="steps">
                <h2 class="h-xl" id="h-ablauf">So läuft’s</h2>
                <ol>
                    <li><span class="num">1</span><div><h3>Anfrage schicken</h3><p>Mit dem Alter finden wir die passende Gruppe.</p></div></li>
                    <li><span class="num">2</span><div><h3>Die Gruppenleitung meldet sich</h3><p>Per E-Mail oder Telefon und macht einen Termin aus.</p></div></li>
                    <li><span class="num">3</span><div><h3>Reinschnuppern</h3><p>Die Probestunde ist kostenlos und unverbindlich.</p></div></li>
                </ol>
                <p class="cap">Fragen vorab? <a class="text-link" href="/kontakt">Schreib uns</a> oder schau in die <a class="text-link" href="/faq">häufigen Fragen</a>.</p>
            </div>
        </aside>
    </div>
</section>

<style>
    .pgrid {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 24px;
        align-items: start;
        margin-top: 56px;
    }
    .formbox {
        grid-column: 1 / span 7;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    form {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
    }
    form h2 {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .step2 {
        margin-top: 24px;
    }
    .num {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--color-ink);
        color: var(--color-on-ink);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        font-weight: 600;
        flex: none;
    }
    .fld {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    .full {
        grid-column: 1 / -1;
    }
    .opt {
        font-weight: 400;
        color: var(--color-muted);
    }
    .agebox {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .agebox .field {
        width: 96px;
        font-variant-numeric: tabular-nums;
    }
    .unit {
        color: var(--color-body);
    }
    .groups {
        border: 0;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .groups legend {
        margin-bottom: 10px;
    }
    .chip {
        white-space: normal;
        height: auto;
        min-height: 40px;
        padding-top: 8px;
        padding-bottom: 8px;
        text-align: left;
    }
    .hint {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 24px;
    }
    .hp {
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
    }
    .consent {
        display: flex;
        gap: 14px;
        align-items: flex-start;
        background: var(--color-subtle);
        padding: 16px 20px;
        font-size: 15px;
        color: var(--color-body);
    }
    .consent input {
        width: 22px;
        height: 22px;
        margin: 1px 0 0;
        accent-color: var(--color-ink);
        flex: none;
    }
    .formfoot {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
    }
    .err {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        background: var(--color-ink);
        color: var(--color-on-ink);
        padding: 16px 20px;
    }
    .done {
        background: var(--color-subtle);
        padding: 40px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
    }
    .done p {
        color: var(--color-body);
        max-width: 52ch;
    }
    .acts {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }
    .ok {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: var(--color-ink);
        color: var(--color-on-ink);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .info {
        grid-column: 9 / span 4;
        display: flex;
        flex-direction: column;
        gap: 8px;
        position: sticky;
        top: 24px;
    }
    .gbox,
    .steps {
        background: var(--color-subtle);
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        align-items: flex-start;
    }
    .kick {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
    }
    .gbox dl {
        display: flex;
        flex-direction: column;
        gap: 8px;
        color: var(--color-body);
        font-size: 15px;
    }
    .gbox dl div {
        display: flex;
        gap: 10px;
        align-items: flex-start;
    }
    .gbox dt {
        color: var(--color-muted);
        padding-top: 1px;
    }
    .steps ol {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 14px;
    }
    .steps li {
        display: flex;
        gap: 14px;
        align-items: flex-start;
    }
    .steps h3 {
        font-size: 16px;
        font-weight: 600;
    }
    .steps p {
        color: var(--color-body);
        font-size: 15px;
    }
    @media (max-width: 50rem) {
        .pgrid {
            margin-top: 36px;
        }
        .formbox,
        .info {
            grid-column: 1 / -1;
            position: static;
        }
        form {
            grid-template-columns: 1fr;
        }
        .done {
            padding: 28px;
        }
    }
</style>
