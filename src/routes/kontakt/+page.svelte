<script lang="ts">
	/**
	 * Kontaktseite im Aufbau der alten Website: Einleitung, Treffpunkt mit Karte, Kontaktformular,
	 * Ansprechpartner*innen als farbige Kästen (Gruppen in Gruppenfarbe, danach die Ämter).
	 */
	import ContactBox from '$lib/components/contact/ContactBox.svelte';
	import ContactForm from '$lib/components/contact/ContactForm.svelte';
	import { sortOffices } from '$lib/components/contact/contact';
	import OfficeCard from '$lib/components/contact/OfficeCard.svelte';
	import EmailButtons from '$lib/components/EmailButtons.svelte';
	import { groupTitle, leaderText } from '$lib/components/groups/groups';
	import Map from '$lib/components/Map.svelte';
	import Notice from '$lib/components/Notice.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const offices = $derived(sortOffices(data.offices));
	const groups = $derived(data.groups);
	const hasContacts = $derived(groups.length > 0 || offices.length > 0);
</script>

<Seo
	title="Kontakt"
	description="Nimm Kontakt mit dem Stamm Edelweißpiraten auf. Hier findest du unser Formular, unsere Ansprechpartner*innen und unseren Treffpunkt in Bremen-Hastedt."
/>

<div class="container-page section-y space-y-10">
	<!-- Einleitung -->
	<div class="space-y-4">
		<h1 class="text-3xl font-bold text-gray-800">Kontakt</h1>
		<p class="leading-relaxed text-gray-700">
			Du hast Fragen oder möchtest bei uns reinschnuppern? Melde dich gerne bei unseren
			Ansprechpartner*innen oder komm direkt zu einer Gruppenstunde vorbei.
		</p>
	</div>

	<!-- Treffpunkt -->
	<section id="treffpunkt" aria-labelledby="treffpunkt-titel" class="scroll-mt-24 space-y-2">
		<h2 id="treffpunkt-titel" class="text-2xl font-semibold text-gray-800">Unser Treffpunkt</h2>
		<address class="text-gray-600 not-italic">
			Ev. Kirchengemeinde Bremen-Hastedt<br />
			Stamm Edelweißpiraten<br />
			Drakenburger Str. 42<br />
			28207 Bremen
		</address>
		<div class="mt-4">
			<Map />
		</div>
	</section>

	<!-- Kontaktformular -->
	<section id="kontaktformular" aria-labelledby="formular-titel" class="scroll-mt-24">
		<h2 id="formular-titel" class="mb-4 text-2xl font-semibold text-gray-800">Kontakt</h2>
		<ContactForm success={data.success} />
	</section>

	<!-- Ansprechpartner*innen -->
	<section aria-labelledby="ansprechpartner-titel" class="space-y-6">
		<h2 id="ansprechpartner-titel" class="text-2xl font-semibold text-gray-800">
			Ansprechpartner*innen
		</h2>

		{#each groups as group (group.id)}
			{@const leaders = leaderText(group)}
			<ContactBox title={groupTitle(group)} color={group.color}>
				{#snippet subtitle()}
					<p class="text-sm text-gray-600">
						<a class="underline underline-offset-4 hover:text-gray-900" href="/gruppen/{group.slug}"
							>{group.name}</a
						>
					</p>
				{/snippet}
				{#if leaders}
					<p class="mt-1"><span class="font-bold">Ansprechpartner*innen</span><br />{leaders}</p>
				{/if}
				{#if group.contactEmail}
					<p class="mt-1">
						<span class="font-bold">E-Mail</span><br /><span class="break-all"
							>{group.contactEmail}</span
						>
					</p>
					<EmailButtons
						email={group.contactEmail}
						subject="Anfrage zur Gruppe {group.name}"
						color={group.color}
						class="mt-4 mb-2"
					/>
				{/if}
			</ContactBox>
		{/each}

		{#each offices as office (office.id)}
			<OfficeCard {office} />
		{/each}

		{#if data.officesError || data.groupsError}
			<Notice
				title="Nicht alle Ansprechpartner*innen konnten gerade geladen werden"
				message="Nutze bis dahin gern das Kontaktformular – wir leiten deine Nachricht weiter."
			/>
		{:else if !hasContacts}
			<Notice tone="info" title="">
				<p>Schreib uns gern über das Kontaktformular – wir leiten deine Nachricht weiter.</p>
			</Notice>
		{/if}

		<p>
			<a
				href="/team"
				class="inline-flex min-h-11 items-center gap-2 rounded border border-gray-300 bg-white px-4 py-2 font-medium text-gray-800 transition-colors hover:bg-gray-100"
			>
				Ganzes Team ansehen <span aria-hidden="true">→</span>
			</a>
		</p>
	</section>
</div>
