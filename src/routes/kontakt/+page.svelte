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

<div class="mx-auto max-w-5xl px-6 pt-12 space-y-12">
    <header>
        <h1 class="text-3xl font-bold text-ink sm:text-[36px]">Kontakt</h1>
        <p class="mt-3 max-w-3xl leading-relaxed">
            Du hast Fragen oder möchtest bei uns reinschnuppern? Melde dich gerne bei unseren Ansprechpartner*innen oder komm
            direkt zu einer Gruppenstunde vorbei.
        </p>
    </header>

    <section id="kontakt" aria-labelledby="h-formular">
        <h2 id="h-formular" class="mb-4 text-[26px] font-bold text-ink">Nachricht schreiben</h2>

        {#if $page?.url?.searchParams?.get('success') === '1'}
            <div class="mb-6 border border-green-300 bg-green-50 text-green-800 p-4" role="status">
                <strong>Danke!</strong> Deine Nachricht wurde versendet. Wir melden uns so schnell wie möglich.
            </div>
        {/if}

        {#if form?.error}
            <div class="mb-6 border border-red-300 bg-red-50 text-red-800 p-4" role="alert">{form.error}</div>
        {/if}

        <!-- Versand über den eigenen Server (lib/server/contact.ts), feste Empfängeradresse -->
        <form method="POST" class="max-w-3xl space-y-4">
            <!-- Honeypot (Anti-Spam): für Menschen unsichtbar -->
            <div class="hidden" aria-hidden="true">
                <label>Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
                <div>
                    <label for="contact-name" class="block text-sm font-medium text-ink mb-1">Name *</label>
                    <input id="contact-name" name="name" type="text" required maxlength="100" value={values?.name ?? ''}
                           autocomplete="name" aria-invalid={errors.name ? 'true' : undefined} class="w-full border border-gray-400 bg-surface text-ink rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-700/40" />
                    {#if errors.name}<p class="text-sm text-red-700 mt-1">{errors.name}</p>{/if}
                </div>
                <div>
                    <label for="contact-email" class="block text-sm font-medium text-ink mb-1">E-Mail *</label>
                    <input id="contact-email" name="email" type="email" required maxlength="254" value={values?.email ?? ''}
                           autocomplete="email" aria-invalid={errors.email ? 'true' : undefined} class="w-full border border-gray-400 bg-surface text-ink rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-700/40" />
                    {#if errors.email}<p class="text-sm text-red-700 mt-1">{errors.email}</p>{/if}
                </div>
                <div class="md:col-span-2">
                    <label for="contact-phone" class="block text-sm font-medium text-ink mb-1">Telefon (optional)</label>
                    <input id="contact-phone" name="phone" type="tel" maxlength="40" value={values?.phone ?? ''}
                           autocomplete="tel" aria-invalid={errors.phone ? 'true' : undefined} class="w-full border border-gray-400 bg-surface text-ink rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-700/40" />
                    {#if errors.phone}<p class="text-sm text-red-700 mt-1">{errors.phone}</p>{/if}
                </div>
                <div class="md:col-span-2">
                    <label for="contact-message" class="block text-sm font-medium text-ink mb-1">Nachricht *</label>
                    <textarea id="contact-message" name="message" rows="6" required maxlength="5000"
                              aria-invalid={errors.message ? 'true' : undefined} class="w-full border border-gray-400 bg-surface text-ink rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-700/40">{values?.message ?? ''}</textarea>
                    {#if errors.message}<p class="text-sm text-red-700 mt-1">{errors.message}</p>{/if}
                </div>
                <div class="md:col-span-2 flex items-start gap-2">
                    <input id="consent" name="consent" type="checkbox" required class="mt-1">
                    <label for="consent" class="text-sm">
                        Ich habe die <a href="/datenschutz#m182" class="text-link">Hinweise zum Datenschutz</a> gelesen und bin einverstanden, dass meine Angaben zur Kontaktaufnahme verarbeitet werden.
                    </label>
                </div>
                {#if errors.consent}<p class="md:col-span-2 text-sm text-red-700">{errors.consent}</p>{/if}
            </div>

            <button type="submit" class="inline-flex items-center rounded bg-blue-700 px-5 py-2.5 font-medium text-white hover:bg-blue-800">
                Nachricht senden
            </button>
        </form>
    </section>

    <section aria-labelledby="h-ansprech">
        <h2 id="h-ansprech" class="mb-2 text-[26px] font-bold text-ink">Ansprechpartner*innen</h2>

        <!-- Gruppen (aus dem Intern-Bereich) -->
        {#each data.groups as group (group.slug)}
            <div class="border-t border-line py-6">
                <h3 class="text-xl font-bold">
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
            <h3 class="text-xl font-bold text-brand">Stammesführung</h3>
            <p class="mt-1">Larissa, Lina und Matilda</p>
            <p class="mt-1">E-Mail: <span class="text-ink">stafues@edelweisspiraten-bremen.de</span></p>
            <EmailButtons email="stafues@edelweisspiraten-bremen.de" />
        </div>
    </section>

    <section aria-labelledby="h-treffpunkt">
        <h2 id="h-treffpunkt" class="mb-3 text-[26px] font-bold text-ink">Unser Treffpunkt</h2>
        <p class="mb-4">
            Ev. Kirchengemeinde Bremen-Hastedt<br/>
            Stamm Edelweißpiraten<br/>
            Drakenburger Str. 42<br/>
            28207 Bremen
        </p>
        <Map height="h-[360px]" />
    </section>
</div>
