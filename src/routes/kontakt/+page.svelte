<script lang="ts">
	import ContactForm from '$lib/components/contact/ContactForm.svelte';
	import OfficeCard from '$lib/components/contact/OfficeCard.svelte';
	import Map from '$lib/components/Map.svelte';
	import Notice from '$lib/components/Notice.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const offices = $derived([...data.offices].sort((a, b) => a.position - b.position));
</script>

<Seo
	title="Kontakt"
	description="Nimm Kontakt mit dem Stamm Edelweißpiraten auf. Hier findest du unser Formular, unsere Ansprechpartner*innen und unseren Treffpunkt in Bremen-Hastedt."
/>

<PageHeader
	eyebrow="Kontakt"
	title="Sprich uns an"
	lead="Du hast Fragen oder möchtest bei uns reinschnuppern? Melde dich gerne bei unseren Ansprechpartner*innen oder komm direkt zu einer Gruppenstunde vorbei."
/>

<div class="container-page section-y space-y-16">
	<!-- Treffpunkt -->
	<section id="treffpunkt" aria-labelledby="treffpunkt-titel" class="scroll-mt-24">
		<div class="grid gap-8 lg:grid-cols-[1fr_2fr] lg:items-start">
			<div>
				<h2 id="treffpunkt-titel" class="text-2xl sm:text-3xl">Unser Treffpunkt</h2>
				<address class="mt-4 leading-relaxed text-ink/85 not-italic">
					Ev. Kirchengemeinde Bremen-Hastedt<br />
					Stamm Edelweißpiraten<br />
					Drakenburger Str. 42<br />
					28207 Bremen
				</address>
				<p class="mt-4 text-sm text-muted">
					Die Gruppenstunden finden in den Räumen der Ev. Auferstehungsgemeinde statt. Wann sich
					welche Gruppe trifft, steht auf den <a class="link" href="/gruppen">Gruppenseiten</a>.
				</p>
			</div>
			<Map />
		</div>
	</section>

	<!-- Ansprechpartner*innen -->
	{#if data.officesError && offices.length === 0}
		<section aria-labelledby="ansprechpartner-titel">
			<h2 id="ansprechpartner-titel" class="mb-6 text-2xl sm:text-3xl">Ansprechpartner*innen</h2>
			<Notice
				title="Die Ansprechpartner*innen konnten gerade nicht geladen werden"
				message="Nutze bis dahin gern das Kontaktformular – wir leiten deine Nachricht weiter."
			/>
		</section>
	{:else if offices.length > 0}
		<section aria-labelledby="ansprechpartner-titel">
			<h2 id="ansprechpartner-titel" class="text-2xl sm:text-3xl">Ansprechpartner*innen</h2>
			<p class="mt-2 mb-8 max-w-2xl text-muted">
				Für viele Fragen gibt es bei uns feste Zuständige. Schreib ihnen direkt – oder nutze das
				Kontaktformular weiter unten.
			</p>
			<ul class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
				{#each offices as office (office.id)}
					<li><OfficeCard {office} /></li>
				{/each}
			</ul>
		</section>
	{/if}

	<!-- Kontaktformular -->
	<section id="kontaktformular" aria-labelledby="formular-titel" class="scroll-mt-24">
		<div class="grid gap-8 lg:grid-cols-[1fr_2fr]">
			<div>
				<h2 id="formular-titel" class="text-2xl sm:text-3xl">Schreib uns</h2>
				<p class="mt-3 leading-relaxed text-muted">
					Wir beantworten deine Nachricht so schnell wie möglich. Nach dem Absenden bekommst du eine
					kurze Bestätigung per E-Mail.
				</p>
			</div>
			<div>
				<ContactForm success={data.success} />
			</div>
		</div>
	</section>
</div>
