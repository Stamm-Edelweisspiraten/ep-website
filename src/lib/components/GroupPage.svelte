<script>
    // Gruppenseite im Aufbau der alten Meute-/Sippen-Seiten; Inhalte kommen aus dem Intern-Bereich
    // (Gruppendialog → Allgemein + Reiter Website). Die Gruppenfarbe ersetzt die früheren festen Farben.
    import Map from '$lib/components/Map.svelte';
    import EmailButtons from '$lib/components/EmailButtons.svelte';
    import AppointmentPreview from '$lib/components/AppointmentPreview.svelte';

    /** @type {import('$lib/server/backend').Group} */
    export let group;

    $: dark = `color-mix(in srgb, ${group.color} 78%, black)`;
    $: when = [group.weekday, group.time].filter(Boolean).join(' ');
</script>

<svelte:head>
    <title>Stamm Edelweißpiraten – {group.name}</title>
    <meta
            name="description"
            content={`${group.typeLabel} der Edelweißpiraten${group.ageRange ? ` (${group.ageRange})` : ''} in Bremen-Hastedt: ${group.teaser}`}
    />
</svelte:head>

<section class="max-w-5xl mx-auto px-6 py-12 space-y-6">

    <h2 class="text-2xl font-bold" style:color={dark}>{group.typeLabel}</h2>
    <div class="bg-white border border-gray-300 p-8 w-full flex flex-col md:flex-row gap-6 items-start">
        <div class="flex-1">
            <p class="text-gray-700">Gruppenname</p>
            <p class="text-sm text-gray-500">{group.name}</p>

            {#if group.leaders}
                <p class="text-gray-700 mt-2">Gruppenleiter</p>
                <p class="text-sm text-gray-500">{group.leaders}</p>
            {/if}

            {#if when}
                <p class="text-gray-700 mt-2">Uhrzeit</p>
                <p class="text-sm text-gray-500">{when}</p>
            {/if}

            {#if group.meetingPlace}
                <p class="text-gray-700 mt-2">Ort</p>
                <p class="text-sm text-gray-500">{group.meetingPlace}</p>
            {/if}

            {#if group.ageRange}
                <p class="text-gray-700 mt-2">Alter</p>
                <p class="text-sm text-gray-500">{group.ageRange}</p>
            {/if}
        </div>

        {#if group.image}
            <div class="w-full md:w-1/3 flex-shrink-0">
                <img
                        src={group.image}
                        alt="Gruppenbild {group.name}"
                        class="w-full h-auto object-cover rounded"
                />
            </div>
        {/if}
    </div>

    {#if group.description}
        <h2 class="text-2xl mb-2 font-bold" style:color={dark}>Das sind wir</h2>
        <p class="text-gray-700 leading-relaxed text-justify whitespace-pre-line">{group.description}</p>
    {/if}

    <h2 class="text-2xl mb-2 font-bold" style:color={dark}>Treffpunkt</h2>
    <Map/>

    <div class="space-y-6 mt-20  mb-20">
        <div
                class="border-l-4 p-4"
                style:border-color={group.color}
                style:background-color={`color-mix(in srgb, ${group.color} 8%, white)`}
        >
            <h3 class="text-xl font-bold" style:color={dark}>{group.title}</h3>
            {#if group.leaders}
                <p class="text-gray-700 mt-1"><span class="font-bold">Ansprechpartner</span><br>{group.leaders}</p>
            {/if}
            {#if group.contactEmail}
                <p class="text-gray-700 mt-1"><span class="font-bold">E-Mail</span><br>{group.contactEmail}</p>
                <EmailButtons email={group.contactEmail} color={group.color} />
            {:else}
                <p class="text-gray-700 mt-1">
                    Schreib uns gern über das <a href="/kontakt" class="underline">Kontaktformular</a>.
                </p>
            {/if}
        </div>
    </div>

    <AppointmentPreview gruppe={group.title} slug={group.slug}/>
</section>
