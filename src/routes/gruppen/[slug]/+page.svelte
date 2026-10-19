<script lang="ts">
	import EmailButtons from '$lib/components/EmailButtons.svelte';
	import UpcomingEvents from '$lib/components/events/UpcomingEvents.svelte';
	import {
		GROUP_TYPE_LABELS,
		GROUP_TYPE_LEADS,
		groupImage,
		leaderText
	} from '$lib/components/groups/groups';
	import Map from '$lib/components/Map.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { formatMeeting, safeColor } from '$lib/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const group = $derived(data.group);
	const color = $derived(safeColor(group.color));
	const image = $derived(groupImage(group));
	const typeLabel = $derived(GROUP_TYPE_LABELS[group.type] ?? 'Gruppe');
	const leaders = $derived(leaderText(group));
	const meeting = $derived(formatMeeting(group.meetingWeekday, group.meetingTime));

	const facts = $derived(
		[
			{ label: 'Gruppenname', value: group.name },
			{ label: 'Gruppenleitung', value: leaders },
			{ label: 'Gruppenstunde', value: meeting },
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

<header class="border-b border-line bg-surface">
	<div class="h-1.5 w-full bg-brand-500" style:background-color={color} aria-hidden="true"></div>
	<div class="container-page py-10 sm:py-14">
		<nav aria-label="Brotkrümelnavigation" class="mb-4 text-sm text-muted">
			<a href="/gruppen" class="hover:text-brand-800 hover:underline">Gruppen</a>
			<span aria-hidden="true"> / </span>
			<span>{typeLabel}</span>
		</nav>
		<p class="eyebrow inline-flex items-center gap-2">
			<span
				class="size-2.5 rounded-full bg-brand-500"
				style:background-color={color}
				aria-hidden="true"
			></span>
			{typeLabel}{group.ageRange ? ` · ${group.ageRange}` : ''}
		</p>
		<h1 class="mt-2 text-3xl sm:text-5xl">{group.name}</h1>
		<p class="mt-3 max-w-2xl text-lg text-muted">{GROUP_TYPE_LEADS[group.type] ?? ''}</p>
	</div>
</header>

<div class="container-page section-y space-y-14">
	<!-- Steckbrief -->
	<section aria-labelledby="steckbrief">
		<h2 id="steckbrief" class="sr-only">Steckbrief</h2>
		<div
			class="grid overflow-hidden rounded-card border border-line bg-surface shadow-card {image
				? 'md:grid-cols-[3fr_2fr]'
				: ''}"
		>
			<dl class="grid content-start gap-5 p-6 sm:grid-cols-2 sm:p-8">
				{#each facts as fact (fact.label)}
					<div class={fact.label === 'Gruppenname' ? 'sm:col-span-2' : ''}>
						<dt class="text-xs font-semibold tracking-wider text-muted uppercase">{fact.label}</dt>
						<dd class="mt-1 text-lg font-medium text-ink">{fact.value}</dd>
					</div>
				{/each}
			</dl>
			{#if image}
				<div class="order-first bg-brand-50 md:order-none">
					<img
						src={image}
						alt="Gruppenbild {group.name}"
						class="h-full max-h-96 w-full object-cover md:max-h-none"
					/>
				</div>
			{/if}
		</div>
	</section>

	<div class="grid gap-14 lg:grid-cols-[3fr_2fr]">
		<!-- Beschreibung -->
		<section aria-labelledby="das-sind-wir">
			<h2 id="das-sind-wir" class="text-2xl sm:text-3xl">Das sind wir</h2>
			{#if group.description}
				<p class="prose-site mt-4 text-lg whitespace-pre-line">{group.description}</p>
			{:else}
				<p class="mt-4 text-muted">
					Die {group.name} stellen sich hier bald ausführlicher vor. Schau gern einfach in einer Gruppenstunde
					vorbei!
				</p>
			{/if}
		</section>

		<!-- Kontakt -->
		<aside aria-labelledby="ansprechpartner" class="self-start">
			<div
				class="rounded-card border border-line border-l-4 border-l-brand-500 bg-surface p-6 shadow-card"
				style:border-left-color={color}
			>
				<h2 id="ansprechpartner" class="text-xl">Kontakt zur Gruppe</h2>
				{#if leaders}
					<p class="mt-3 text-sm text-muted">Ansprechpartner*innen</p>
					<p class="font-medium">{leaders}</p>
				{/if}
				{#if group.contactEmail}
					<p class="mt-3 text-sm text-muted">E-Mail</p>
					<p class="font-medium break-all">{group.contactEmail}</p>
					<EmailButtons
						email={group.contactEmail}
						subject="Anfrage zur Gruppe {group.name}"
						class="mt-5"
					/>
				{:else}
					<p class="mt-3 text-muted">
						Schreib uns gern über die <a class="link" href="/kontakt">Kontaktseite</a>.
					</p>
				{/if}
			</div>
		</aside>
	</div>

	<!-- Termine -->
	<UpcomingEvents
		events={data.events}
		error={data.eventsError}
		title="Nächste Termine"
		moreHref="/termine?gruppe={encodeURIComponent(group.id)}"
		emptyText="Für diese Gruppe stehen gerade keine besonderen Termine an – die Gruppenstunde findet wie gewohnt statt."
	/>

	<!-- Treffpunkt -->
	<section aria-labelledby="treffpunkt" class="space-y-4">
		<h2 id="treffpunkt" class="text-2xl sm:text-3xl">Treffpunkt</h2>
		{#if group.meetingPlace}
			<p class="text-muted">Wir treffen uns: {group.meetingPlace}</p>
		{/if}
		<Map />
	</section>
</div>
