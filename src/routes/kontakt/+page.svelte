<script lang="ts">
	/**
	 * Kontaktseite: Kontaktformular neben Treffpunkt mit Karte, darunter die Ansprechpartner*innen als
	 * farbige Kästen (Gruppen in Gruppenfarbe, danach die Ämter).
	 */
	import ContactBox from '$lib/components/contact/ContactBox.svelte';
	import ContactForm from '$lib/components/contact/ContactForm.svelte';
	import { sortOffices } from '$lib/components/contact/contact';
	import OfficeCard from '$lib/components/contact/OfficeCard.svelte';
	import EmailButtons from '$lib/components/EmailButtons.svelte';
	import { groupTitle, leaderText } from '$lib/components/groups/groups';
	import Map from '$lib/components/Map.svelte';
	import Notice from '$lib/components/Notice.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
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

<PageHeader
	eyebrow="Kontakt"
	title="Schreib uns!"
	lead="Du hast Fragen oder möchtest bei uns reinschnuppern? Melde dich gerne bei unseren Ansprechpartner*innen oder komm direkt zu einer Gruppenstunde vorbei."
/>

<div class="container-page section-y space-y-16">
	<div class="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
		<!-- Kontaktformular -->
		<section id="kontaktformular" aria-labelledby="formular-titel" class="scroll-mt-24">
			<h2 id="formular-titel" class="section-title mb-6">Nachricht senden</h2>
			<ContactForm success={data.success} />
		</section>

		<!-- Treffpunkt -->
		<section id="treffpunkt" aria-labelledby="treffpunkt-titel" class="scroll-mt-24">
			<h2 id="treffpunkt-titel" class="section-title mb-6">Unser Treffpunkt</h2>
			<address class="card mb-4 p-5 leading-relaxed text-gray-700 not-italic">
				<span class="font-semibold text-ink">Ev. Kirchengemeinde Bremen-Hastedt</span><br />
				Stamm Edelweißpiraten<br />
				Drakenburger Str. 42<br />
				28207 Bremen
			</address>
			<Map class="h-[320px]" />
		</section>
	</div>

	<!-- Ansprechpartner*innen -->
	<section aria-labelledby="ansprechpartner-titel" class="space-y-6">
		<div class="flex flex-wrap items-end justify-between gap-3">
			<h2 id="ansprechpartner-titel" class="section-title">Ansprechpartner*innen</h2>
			<a href="/team" class="link-more">Ganzes Team ansehen <span aria-hidden="true">→</span></a>
		</div>

		<ul class="grid gap-6 md:grid-cols-2">
			{#each groups as group (group.id)}
				{@const leaders = leaderText(group)}
				<li>
					<ContactBox title={groupTitle(group)} color={group.color} class="h-full">
						{#snippet subtitle()}
							<p class="text-sm">
								<a class="link" href="/gruppen/{group.slug}">{group.name}</a>
							</p>
						{/snippet}
						{#if leaders}
							<p class="mt-3">
								<span class="block text-xs font-semibold tracking-wide text-muted uppercase"
									>Ansprechpartner*innen</span
								>
								<span class="font-semibold text-ink">{leaders}</span>
							</p>
						{/if}
						{#if group.contactEmail}
							<p class="mt-3">
								<span class="block text-xs font-semibold tracking-wide text-muted uppercase"
									>E-Mail</span
								>
								<span class="break-all text-ink">{group.contactEmail}</span>
							</p>
							<EmailButtons
								email={group.contactEmail}
								subject="Anfrage zur Gruppe {group.name}"
								color={group.color}
								class="mt-5"
							/>
						{/if}
					</ContactBox>
				</li>
			{/each}

			{#each offices as office (office.id)}
				<li><OfficeCard {office} /></li>
			{/each}
		</ul>

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
	</section>
</div>
