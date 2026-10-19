<script lang="ts">
	/**
	 * Steckbrief einer Gruppe: Kopf in Gruppenfarbe (Typ, Name, Eckdaten, Bild), „Das sind wir“,
	 * „Treffpunkt“ mit Karte, Kontaktkasten daneben und darunter die nächsten Termine.
	 */
	import ContactBox from '$lib/components/contact/ContactBox.svelte';
	import EmailButtons from '$lib/components/EmailButtons.svelte';
	import UpcomingEvents from '$lib/components/events/UpcomingEvents.svelte';
	import {
		GROUP_TYPE_LABELS,
		groupColor,
		groupImage,
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

<div style:--group-color={color}>
	<!-- Kopf in Gruppenfarbe: Typ, Name, Eckdaten und Bild -->
	<header class="group-hero border-b border-line">
		<div class="container-page py-10 sm:py-14">
			<a href="/gruppen" class="link-more mb-6 text-sm">
				<span aria-hidden="true">←</span> Alle Gruppen
			</a>
			<div class="grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
				<div>
					<p class="group-heading text-xs font-bold tracking-[0.14em] uppercase">
						{typeLabel}{#if group.ageRange}&nbsp;· {group.ageRange}{/if}
					</p>
					<h1 class="mt-2 text-3xl font-extrabold sm:text-5xl">
						<span class="sr-only">{typeLabel}: </span>{group.name}
					</h1>
					<dl class="mt-8 grid gap-3 sm:grid-cols-2">
						{#each facts as fact (fact.label)}
							<div class="rounded-xl border border-white bg-white/80 px-4 py-3 shadow-sm">
								<dt class="text-xs font-semibold tracking-wide text-muted uppercase">
									{fact.label}
								</dt>
								<dd class="mt-0.5 font-semibold text-ink">{fact.value}</dd>
							</div>
						{/each}
					</dl>
				</div>
				{#if image}
					<div class="flex justify-center">
						<img
							src={image}
							alt="Gruppenbild {group.name}"
							class="h-auto max-h-80 w-full max-w-sm object-contain drop-shadow-xl"
							decoding="async"
						/>
					</div>
				{/if}
			</div>
		</div>
	</header>

	<div class="container-page section-y">
		<div class="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
			<!-- Beschreibung und Treffpunkt -->
			<div class="space-y-10">
				<section aria-labelledby="das-sind-wir">
					<h2 id="das-sind-wir" class="section-title">Das sind wir</h2>
					{#if group.description}
						<p class="mt-4 text-lg leading-relaxed whitespace-pre-line text-gray-700">
							{group.description}
						</p>
					{:else}
						<p class="mt-4 text-lg leading-relaxed text-gray-700">
							Die Gruppe „{group.name}“ stellt sich hier bald ausführlicher vor. Schau gern einfach
							in einer Gruppenstunde vorbei!
						</p>
					{/if}
				</section>

				<section aria-labelledby="treffpunkt" class="space-y-4">
					<h2 id="treffpunkt" class="section-title">Treffpunkt</h2>
					{#if group.meetingPlace}
						<p class="text-gray-700">{group.meetingPlace}</p>
					{/if}
					<Map class="h-[320px]" />
				</section>
			</div>

			<!-- Kontakt -->
			<aside class="lg:sticky lg:top-24 lg:self-start">
				<ContactBox title="Kontakt" color={group.color} heading="h2">
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
					{:else}
						<p class="mt-3">
							Schreib uns gern über die <a class="link" href="/kontakt">Kontaktseite</a>.
						</p>
					{/if}
				</ContactBox>
			</aside>
		</div>

		<!-- Termine -->
		<UpcomingEvents
			class="mt-16"
			events={data.events}
			error={data.eventsError}
			title="Nächste Termine"
			moreHref="/termine?gruppe={encodeURIComponent(group.slug)}"
			emptyText="Für diese Gruppe stehen gerade keine besonderen Termine an – die Gruppenstunde findet wie gewohnt statt."
		/>
	</div>
</div>

<style>
	.group-hero {
		background:
			radial-gradient(
				50rem 20rem at 90% 10%,
				color-mix(in srgb, var(--group-color) 22%, transparent),
				transparent 70%
			),
			color-mix(in srgb, var(--group-color) 8%, white);
	}
	.group-heading {
		color: color-mix(in srgb, var(--group-color) 75%, black);
	}
</style>
