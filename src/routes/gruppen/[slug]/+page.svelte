<script lang="ts">
	/**
	 * Steckbrief einer Gruppe – aufgebaut wie die Meute-/Sippe-Seiten der alten Website:
	 * Typ-Überschrift in Gruppenfarbe, umrahmte Steckbrief-Karte mit Bild rechts, „Das sind wir“,
	 * „Treffpunkt“ mit Karte, Kontaktkasten und darunter die nächsten Termine.
	 */
	import ContactBox from '$lib/components/contact/ContactBox.svelte';
	import EmailButtons from '$lib/components/EmailButtons.svelte';
	import UpcomingEvents from '$lib/components/events/UpcomingEvents.svelte';
	import {
		GROUP_TYPE_LABELS,
		groupColor,
		groupImage,
		groupTitle,
		leaderText
	} from '$lib/components/groups/groups';
	import Map from '$lib/components/Map.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { formatMeeting } from '$lib/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const group = $derived(data.group);
	const color = $derived(groupColor(group));
	const image = $derived(groupImage(group));
	const typeLabel = $derived(GROUP_TYPE_LABELS[group.type] ?? 'Gruppe');
	const leaders = $derived(leaderText(group));
	const meeting = $derived(
		formatMeeting(group.meetingWeekday, group.meetingTime, group.meetingEndTime)
	);

	const facts = $derived(
		[
			{ label: 'Gruppenname', value: group.name },
			{ label: 'Gruppenleitung', value: leaders },
			{ label: 'Uhrzeit', value: meeting },
			{ label: 'Ort', value: group.meetingPlace ?? '' },
			{ label: 'Alter', value: group.ageRange ?? '' }
		].filter((f) => f.value)
	);

	const seoDescription = $derived(
		[
			`${typeLabel} „${group.name}“ der Edelweißpiraten in Bremen-Hastedt`,
			group.ageRange,
			meeting ? `Gruppenstunde ${meeting}` : null
		]
			.filter(Boolean)
			.join(' · ')
	);
</script>

<Seo title={group.name} description={seoDescription} image={image ?? undefined} />

<section class="container-page section-y space-y-6" style:--group-color={color}>
	<h1 class="group-heading text-2xl font-bold">
		{typeLabel}<span class="sr-only">: {group.name}</span>
	</h1>

	<!-- Steckbrief -->
	<div
		class="flex w-full flex-col items-start gap-6 border border-gray-300 bg-white p-8 md:flex-row"
	>
		<dl class="flex-1 space-y-2">
			{#each facts as fact (fact.label)}
				<div>
					<dt class="text-gray-700">{fact.label}</dt>
					<dd class="text-sm text-gray-500">{fact.value}</dd>
				</div>
			{/each}
		</dl>
		{#if image}
			<div class="w-full shrink-0 md:w-1/3">
				<img
					src={image}
					alt="Gruppenbild {group.name}"
					class="h-auto w-full rounded object-cover"
					decoding="async"
				/>
			</div>
		{/if}
	</div>

	<!-- Beschreibung -->
	<h2 class="group-heading mb-2 text-2xl font-bold">Das sind wir</h2>
	{#if group.description}
		<p class="leading-relaxed whitespace-pre-line text-gray-700 sm:text-justify">
			{group.description}
		</p>
	{:else}
		<p class="leading-relaxed text-gray-700">
			Die Gruppe „{group.name}“ stellt sich hier bald ausführlicher vor. Schau gern einfach in einer
			Gruppenstunde vorbei!
		</p>
	{/if}

	<!-- Treffpunkt -->
	<h2 class="group-heading mb-2 text-2xl font-bold">Treffpunkt</h2>
	{#if group.meetingPlace}
		<p class="text-gray-700">{group.meetingPlace}</p>
	{/if}
	<Map />

	<!-- Kontakt -->
	<div class="my-12 sm:my-20">
		<ContactBox title={groupTitle(group)} color={group.color}>
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
					class="mt-6"
				/>
			{:else}
				<p class="mt-1">
					Schreib uns gern über die <a class="link" href="/kontakt">Kontaktseite</a>.
				</p>
			{/if}
		</ContactBox>
	</div>

	<!-- Termine -->
	<UpcomingEvents
		events={data.events}
		error={data.eventsError}
		title="Nächste Termine"
		moreHref="/termine?gruppe={encodeURIComponent(group.slug)}"
		emptyText="Für diese Gruppe stehen gerade keine besonderen Termine an – die Gruppenstunde findet wie gewohnt statt."
	/>
</section>

<style>
	/* Überschriften in Gruppenfarbe (wie text-green-700 auf der alten Website) */
	.group-heading {
		color: color-mix(in srgb, var(--group-color) 80%, black);
	}
</style>
