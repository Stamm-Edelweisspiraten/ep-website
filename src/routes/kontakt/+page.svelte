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
</script>

<section class="max-w-5xl mx-auto px-6 py-12 space-y-10">

    <!-- Intro -->
    <h1 class="text-3xl font-bold text-gray-800">Kontakt</h1>
    <p class="text-gray-700 leading-relaxed">
        Du hast Fragen oder möchtest bei uns reinschnuppern? Melde dich gerne bei unseren Ansprechpartnern oder komm
        direkt zu einer Gruppenstunde vorbei.
    </p>

    <!-- Adresse -->
    <div class="space-y-2">
        <h2 class="text-2xl font-semibold text-gray-800">Unser Treffpunkt</h2>
        <p class="text-gray-600">
            Ev. Kirchengemeinde Bremen-Hastedt<br/>
            Stamm Edelweißpiraten<br/>
            Drakenburger Str. 42<br/>
            28207 Bremen
        </p>
        <div class="mt-4">
            <Map/>
        </div>
    </div>

    <!-- KONTAKT -->
    <section id="kontakt" class="mx-auto">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Kontakt</h2>

        {#if $page?.url?.searchParams?.get('success') === '1'}
            <div class="mb-6 border border-green-300 bg-green-50 text-green-800 p-4 rounded">
                <strong>Danke!</strong> Deine Nachricht wurde erfolgreich versendet. Wir melden uns so schnell wie möglich.
            </div>
        {/if}

        <form
                action="https://formsubmit.co/kotakt@edelweisspiraten-bremen.de"
        method="POST"
        class="bg-white border border-gray-300 p-6 md:p-8 rounded space-y-4"
        >
        <!-- FormSubmit-Optionen -->
        <input type="hidden" name="_subject" value="Neue Nachricht – Stamm Edelweißpiraten">
        <input type="hidden" name="_template" value="table">
        <input type="hidden" name="_captcha" value="false">
        <input type="hidden" name="_next" value="https://edelweisspiraten-bremen.de/kontakt/?success=1#kontakt">

        <!-- Honeypot (Anti-Spam) -->
        <input type="text" name="_honey" class="hidden" tabindex="-1" autocomplete="off">
        <input type="hidden" name="_autoresponse" value="Danke für deine Nachricht an den Stamm Edelweißpiraten. Wir melden uns zeitnah zurück.">

        <div class="grid md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input name="name" type="text" required
                       class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">E-Mail *</label>
                <input name="email" type="email" required
                       class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" />
            </div>
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Telefon (optional)</label>
                <input name="phone" type="tel"
                       class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" />
            </div>
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Nachricht *</label>
                <textarea name="message" rows="6" required
                          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"></textarea>
            </div>
            <div class="md:col-span-2 flex items-start gap-2">
                <input id="consent" type="checkbox" required class="mt-1">
                <label for="consent" class="text-sm text-gray-700">
                    Ich habe die Hinweise zum Datenschutz gelesen und bin einverstanden, dass meine Angaben zur Kontaktaufnahme verarbeitet werden.
                </label>
            </div>
        </div>

        <button type="submit"
                class="mt-4 inline-flex items-center px-5 py-2.5 bg-gray-900 text-white font-medium rounded hover:bg-gray-800 transition">
            Nachricht senden →
        </button>
        </form>
    </section>

    <!-- Ansprechpartner -->
    <div class="space-y-6">
        <h2 class="text-2xl font-semibold text-gray-800">Ansprechpartner</h2>

        <!-- Gruppen (aus dem Intern-Bereich) -->
        {#each data.groups as group (group.slug)}
            {@const dark = `color-mix(in srgb, ${group.color} 78%, black)`}
            <div
                    class="border-l-4 p-4"
                    style:border-color={group.color}
                    style:background-color={`color-mix(in srgb, ${group.color} 8%, white)`}
            >
                <h3 class="text-xl font-bold" style:color={dark}>
                    <a href={group.href} class="hover:underline">{group.title}</a>
                </h3>
                {#if group.leaders}
                    <p class="text-gray-700 mt-1"><span class="font-bold">Ansprechpartner</span><br>{group.leaders}</p>
                {/if}
                {#if group.contactEmail}
                    <p class="text-gray-700 mt-1"><span class="font-bold">E-Mail</span><br>{group.contactEmail}</p>
                    <EmailButtons email={group.contactEmail} color={group.color}/>
                {/if}
            </div>
        {/each}

        <!-- Stammesführung -->
        <div class="border-l-4 border-red-400 bg-red-50 p-4">
            <h3 class="text-xl font-bold text-red-700">Stammesführung</h3>
            <p class="text-gray-700 mt-1"><span class="font-bold">Ansprechpartner</span><br>Larissa, Lina und Matilda</p>
            <p class="text-gray-700 mt-1"><span class="font-bold">E-Mail</span><br>stafues@edelweisspiraten-bremen.de
            </p>
            <EmailButtons email="stafues@edelweisspiraten-bremen.de" color="red"/>
        </div>
    </div>

</section>