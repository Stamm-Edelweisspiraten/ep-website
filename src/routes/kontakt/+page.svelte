<svelte:head>
    <title>Stamm Edelweißpiraten – Kontakt</title>
    <meta name="description"
          content="Nimm Kontakt mit dem Stamm Edelweißpiraten auf. Hier findest du unser Formular, E-Mail-Adresse und Standort in Bremen-Hastedt."/>
</svelte:head>

<script>
    import { page } from '$app/stores';
    import Map from '$lib/components/Map.svelte';
    import EmailButtons from '$lib/components/EmailButtons.svelte';

    export let data;
    /** Ergebnis der Form-Action (`+page.server.ts`): Fehlertext, Feldfehler, eingegebene Werte */
    export let form;

    /** @type {Partial<Record<'name' | 'email' | 'phone' | 'message' | 'consent', string>>} */
    let errors = {};
    $: errors = form?.errors ?? {};
    $: values = form?.values ?? null;
</script>

<div class="site-container pt-12">
    <header>
        <h1 class="text-display text-ink">Kontakt</h1>
        <p class="mt-3 max-w-3xl text-lede text-body">
            Du hast Fragen oder möchtest bei uns reinschnuppern? Melde dich gerne bei unseren Ansprechpartner*innen oder komm
            direkt zu einer Gruppenstunde vorbei.
        </p>
    </header>

    <section id="kontakt" class="section-gap" aria-labelledby="h-formular">
        <h2 id="h-formular" class="mb-4 text-section text-ink">Nachricht schreiben</h2>

        {#if $page?.url?.searchParams?.get('success') === '1'}
            <div class="mb-6 max-w-3xl border-l-4 border-notice-line bg-notice p-4 text-ink" role="status">
                <strong>Danke!</strong> Deine Nachricht wurde versendet. Wir melden uns so schnell wie möglich.
            </div>
        {/if}

        {#if form?.error}
            <div class="mb-6 max-w-3xl border-l-4 border-alert-line bg-alert p-4 text-ink" role="alert">{form.error}</div>
        {/if}

        <!-- Versand über den eigenen Server (lib/server/contact.ts), feste Empfängeradresse -->
        <form method="POST" class="max-w-3xl space-y-4">
            <!-- Honeypot (Anti-Spam): für Menschen unsichtbar -->
            <div class="hidden" aria-hidden="true">
                <label>Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
                <div>
                    <label for="contact-name" class="mb-1 block text-small font-medium text-ink">Name *</label>
                    <input id="contact-name" name="name" type="text" required maxlength="100" value={values?.name ?? ''}
                           autocomplete="name" aria-invalid={errors.name ? 'true' : undefined}
                           aria-describedby={errors.name ? 'contact-name-error' : undefined} class="field" />
                    {#if errors.name}<p id="contact-name-error" class="mt-1 border-l-2 border-alert-line pl-2 text-small text-ink" role="alert">{errors.name}</p>{/if}
                </div>
                <div>
                    <label for="contact-email" class="mb-1 block text-small font-medium text-ink">E-Mail *</label>
                    <input id="contact-email" name="email" type="email" required maxlength="254" value={values?.email ?? ''}
                           autocomplete="email" aria-invalid={errors.email ? 'true' : undefined}
                           aria-describedby={errors.email ? 'contact-email-error' : undefined} class="field" />
                    {#if errors.email}<p id="contact-email-error" class="mt-1 border-l-2 border-alert-line pl-2 text-small text-ink" role="alert">{errors.email}</p>{/if}
                </div>
                <div class="md:col-span-2">
                    <label for="contact-phone" class="mb-1 block text-small font-medium text-ink">Telefon (optional)</label>
                    <input id="contact-phone" name="phone" type="tel" maxlength="40" value={values?.phone ?? ''}
                           autocomplete="tel" aria-invalid={errors.phone ? 'true' : undefined}
                           aria-describedby={errors.phone ? 'contact-phone-error' : undefined} class="field" />
                    {#if errors.phone}<p id="contact-phone-error" class="mt-1 border-l-2 border-alert-line pl-2 text-small text-ink" role="alert">{errors.phone}</p>{/if}
                </div>
                <div class="md:col-span-2">
                    <label for="contact-message" class="mb-1 block text-small font-medium text-ink">Nachricht *</label>
                    <textarea id="contact-message" name="message" rows="6" required maxlength="5000"
                              aria-invalid={errors.message ? 'true' : undefined}
                              aria-describedby={errors.message ? 'contact-message-error' : undefined} class="field">{values?.message ?? ''}</textarea>
                    {#if errors.message}<p id="contact-message-error" class="mt-1 border-l-2 border-alert-line pl-2 text-small text-ink" role="alert">{errors.message}</p>{/if}
                </div>
                <div class="md:col-span-2 flex items-start gap-2">
                    <input id="consent" name="consent" type="checkbox" required class="mt-1 size-4 shrink-0 accent-[var(--color-ink)]"
                           aria-invalid={errors.consent ? 'true' : undefined}
                           aria-describedby={errors.consent ? 'consent-error' : undefined}>
                    <label for="consent" class="text-base text-body">
                        Ich habe die <a href="/datenschutz#m182" class="text-link">Hinweise zum Datenschutz</a> gelesen und bin einverstanden, dass meine Angaben zur Kontaktaufnahme verarbeitet werden.
                    </label>
                </div>
                {#if errors.consent}<p id="consent-error" class="md:col-span-2 border-l-2 border-alert-line pl-2 text-small text-ink" role="alert">{errors.consent}</p>{/if}
            </div>

            <button type="submit" class="inline-flex items-center bg-ink px-5 py-2.5 font-medium text-page transition-colors hover:bg-body">
                Nachricht senden
            </button>
        </form>
    </section>

    <section class="section-gap" aria-labelledby="h-ansprech">
        <h2 id="h-ansprech" class="mb-2 text-section text-ink">Ansprechpartner*innen</h2>

        <!-- Gruppen (aus dem Intern-Bereich) -->
        {#each data.groups as group (group.slug)}
            <div class="border-t border-line py-6">
                <h3 class="text-sub">
                    <a href={group.href} class="group-name hover:underline" style="--g: {group.color}">{group.typeLabel} – {group.name}</a>
                </h3>
                {#if group.leaders}<p class="mt-1">Gruppenleitung: <span class="text-ink">{group.leaders}</span></p>{/if}
                {#if group.contactEmail}
                    <p class="mt-1">E-Mail: <span class="text-ink">{group.contactEmail}</span></p>
                    <EmailButtons email={group.contactEmail} />
                {/if}
            </div>
        {/each}

        <!-- Stammesführung -->
        <div class="border-t border-line py-6">
            <h3 class="text-sub text-brand">Stammesführung</h3>
            <p class="mt-1">Larissa, Lina und Matilda</p>
            <p class="mt-1">E-Mail: <span class="text-ink">stafues@edelweisspiraten-bremen.de</span></p>
            <EmailButtons email="stafues@edelweisspiraten-bremen.de" />
        </div>
    </section>

    <section class="section-gap" aria-labelledby="h-treffpunkt">
        <h2 id="h-treffpunkt" class="mb-3 text-section text-ink">Unser Treffpunkt</h2>
        <p class="mb-4">
            Ev. Kirchengemeinde Bremen-Hastedt<br/>
            Stamm Edelweißpiraten<br/>
            Drakenburger Str. 42<br/>
            28207 Bremen
        </p>
        <Map height="h-[360px]" />
    </section>
</div>
