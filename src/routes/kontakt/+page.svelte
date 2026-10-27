<Seo
    title="Kontakt – Stamm Edelweißpiraten"
    description="Nimm Kontakt mit dem Stamm Edelweißpiraten auf. Hier findest du unser Formular, E-Mail-Adressen und den Treffpunkt in Bremen-Hastedt."
    path="/kontakt"
    breadcrumbs={[{ name: 'Kontakt', path: '/kontakt' }]}
/>

<script>
    import Seo from '$lib/components/Seo.svelte';
    import { page } from '$app/stores';
    import Map from '$lib/components/Map.svelte';
    import EmailButtons from '$lib/components/EmailButtons.svelte';
    import Icon from '$lib/components/Icon.svelte';
    import ContactGuard from '$lib/components/ContactGuard.svelte';

    export let data;
    /** Ergebnis der Form-Action (`+page.server.ts`): Fehlertext, Feldfehler, eingegebene Werte */
    export let form;

    /** @type {Partial<Record<'name' | 'email' | 'phone' | 'message' | 'consent', string>>} */
    let errors = {};
    $: errors = form?.errors ?? {};
    $: values = form?.values ?? null;
    $: sent = $page?.url?.searchParams?.get('success') === '1';
</script>

<section class="site-container" aria-labelledby="h-kontakt">
    <nav class="crumbs" aria-label="Brotkrümel"><a href="/">Start</a><Icon name="chevron-right" size={18} /><span aria-current="page">Kontakt</span></nav>
    <div class="phead">
        <h1 class="display" id="h-kontakt">Kontakt</h1>
        <div class="side">
            <p>Du hast Fragen oder möchtest reinschnuppern? Schreib uns, melde dich direkt bei einer Gruppenleitung oder komm einfach zu einer Gruppenstunde vorbei.</p>
        </div>
    </div>

    <div class="cgrid">
        <div class="formbox" id="kontakt">
            <h2 class="h-xl" id="h-formular">Nachricht schreiben</h2>

            {#if sent}
                <div class="done" role="status">
                    <span class="ok"><Icon name="check" size={24} /></span>
                    <h3 class="h-xl">Danke für deine Nachricht</h3>
                    <p>Sie ist bei uns angekommen. Wir melden uns so schnell wie möglich per E-Mail.</p>
                    <a class="pill soft" href="/kontakt">Noch eine Nachricht schreiben</a>
                </div>
            {:else}
                {#if form?.error}
                    <p class="err" role="alert"><Icon name="alert" />{form.error}</p>
                {/if}

                <!-- Versand über den eigenen Server (lib/server/contact.ts), feste Empfängeradresse -->
                <form method="POST" aria-labelledby="h-formular">
                    <!-- Honeypot (Anti-Spam): für Menschen unsichtbar -->
                    <div class="hp" aria-hidden="true">
                        <label>Website <input type="text" name="website" tabindex="-1" autocomplete="off" /></label>
                        <label>Bitte leer lassen <input type="text" name="fax" tabindex="-1" autocomplete="off" /></label>
                    </div>
                    <div class="fld">
                        <label for="contact-name" class="label">Name</label>
                        <input id="contact-name" name="name" type="text" required maxlength="100" value={values?.name ?? ''}
                               autocomplete="name" aria-invalid={errors.name ? 'true' : undefined}
                               aria-describedby={errors.name ? 'contact-name-error' : undefined} class="field" />
                        {#if errors.name}<p id="contact-name-error" class="field-error" role="alert">{errors.name}</p>{/if}
                    </div>
                    <div class="fld">
                        <label for="contact-email" class="label">E-Mail</label>
                        <input id="contact-email" name="email" type="email" required maxlength="254" value={values?.email ?? ''}
                               autocomplete="email" aria-invalid={errors.email ? 'true' : undefined}
                               aria-describedby={errors.email ? 'contact-email-error' : undefined} class="field" />
                        {#if errors.email}<p id="contact-email-error" class="field-error" role="alert">{errors.email}</p>{/if}
                    </div>
                    <div class="fld full">
                        <label for="contact-phone" class="label">Telefon <span class="opt">(freiwillig)</span></label>
                        <input id="contact-phone" name="phone" type="tel" maxlength="40" value={values?.phone ?? ''}
                               autocomplete="tel" aria-invalid={errors.phone ? 'true' : undefined}
                               aria-describedby={errors.phone ? 'contact-phone-error' : undefined} class="field" />
                        {#if errors.phone}<p id="contact-phone-error" class="field-error" role="alert">{errors.phone}</p>{/if}
                    </div>
                    <div class="fld full">
                        <label for="contact-message" class="label">Nachricht</label>
                        <textarea id="contact-message" name="message" rows="6" required maxlength="5000"
                                  aria-invalid={errors.message ? 'true' : undefined}
                                  aria-describedby={errors.message ? 'contact-message-error' : undefined} class="field">{values?.message ?? ''}</textarea>
                        {#if errors.message}<p id="contact-message-error" class="field-error" role="alert">{errors.message}</p>{/if}
                    </div>
                    <div class="full">
                        <div class="consent">
                            <input id="consent" name="consent" type="checkbox" required
                                   aria-invalid={errors.consent ? 'true' : undefined}
                                   aria-describedby={errors.consent ? 'consent-error' : undefined} />
                            <label for="consent">
                                Ich habe die <a href="/datenschutz#m182" class="text-link">Hinweise zum Datenschutz</a> gelesen und bin einverstanden, dass meine Angaben zur Kontaktaufnahme verarbeitet werden.
                            </label>
                        </div>
                        {#if errors.consent}<p id="consent-error" class="field-error" role="alert">{errors.consent}</p>{/if}
                    </div>
                    <ContactGuard />
                    <div class="formfoot full">
                        <p class="cap">Alle Felder außer Telefon sind Pflicht.</p>
                        <button type="submit" class="pill"><Icon name="send" size={18} />Nachricht senden</button>
                    </div>
                </form>
            {/if}
        </div>

        <aside class="people" aria-labelledby="h-ansprech">
            <h2 class="h-xl" id="h-ansprech">Ansprechpartner*innen</h2>
            <div class="pbox">
                <h3>Stammesführung</h3>
                <p class="k">Larissa, Lina und Matilda</p>
                <p class="addr">stafues@edelweisspiraten-bremen.de</p>
                <EmailButtons email="stafues@edelweisspiraten-bremen.de" onCloud />
            </div>
            <!-- Gruppen (aus dem Intern-Bereich) -->
            {#each data.groups as group (group.slug)}
                <div class="pbox">
                    <h3><a href={group.href} class="gl"><span class="dot" style="--g: {group.color}"></span>{group.typeLabel} · {group.name}</a></h3>
                    {#if group.leaders}<p class="k">Gruppenleitung: {group.leaders}</p>{/if}
                    {#if group.contactEmail}
                        <p class="addr">{group.contactEmail}</p>
                        <EmailButtons email={group.contactEmail} onCloud />
                    {/if}
                </div>
            {/each}
        </aside>
    </div>
</section>

<section class="site-container section-gap" id="karte" aria-labelledby="h-treffpunkt">
    <h2 id="h-treffpunkt" class="h-xl" style="margin-bottom: 24px">So findest du uns</h2>
    <div class="where">
        <div class="txt">
            <div class="row"><span class="ic"><Icon name="map-pin" /></span><div><h3>Treffpunkt</h3><p>Ev. Kirchengemeinde Bremen-Hastedt<br />Stamm Edelweißpiraten<br />Drakenburger Str. 42<br />28207 Bremen</p></div></div>
            {#if data.groups.length}
                <div class="row">
                    <span class="ic"><Icon name="clock" /></span>
                    <div>
                        <h3>Gruppenstunden</h3>
                        <p class="tab">
                            {#each data.groups as g, i (g.slug)}{#if i > 0}<br />{/if}{[g.weekday.slice(0, 2), g.time.split(/[–\s]/)[0]].filter(Boolean).join(' ')} · {g.name}{/each}
                        </p>
                    </div>
                </div>
            {/if}
        </div>
        <div class="mapcol"><Map height={420} /></div>
    </div>
</section>

<style>
    .cgrid {
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
    .people {
        grid-column: 9 / span 4;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .people h2 {
        margin-bottom: 12px;
    }
    .pbox {
        background: var(--color-subtle);
        padding: 22px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;
    }
    .pbox h3 {
        font-size: 17px;
        font-weight: 500;
    }
    .gl {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
        color: var(--color-ink);
    }
    .gl:hover {
        text-decoration: underline;
        text-underline-offset: 4px;
    }
    .k {
        font-size: 15px;
        color: var(--color-body);
    }
    .addr {
        font-size: 15px;
        font-weight: 500;
        overflow-wrap: anywhere;
        margin-bottom: 4px;
    }
    .where {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 8px;
    }
    .where .txt {
        grid-column: span 4;
        background: var(--color-subtle);
        padding: 32px;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    .row {
        display: flex;
        gap: 14px;
        align-items: flex-start;
    }
    .row h3 {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 2px;
    }
    .row p {
        color: var(--color-body);
    }
    .mapcol {
        grid-column: span 8;
    }
    @media (max-width: 50rem) {
        .cgrid {
            margin-top: 36px;
        }
        .formbox,
        .people,
        .where .txt,
        .mapcol {
            grid-column: 1 / -1;
        }
        form {
            grid-template-columns: 1fr;
        }
        .done {
            padding: 28px;
        }
    }
</style>
