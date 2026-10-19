<script lang="ts">
	import UpcomingEvents from '$lib/components/events/UpcomingEvents.svelte';
	import GroupGrid from '$lib/components/groups/GroupGrid.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import StammHeader from '$lib/components/StammHeader.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const highlights = [
		{
			title: 'Wöchentliche Gruppenstunden',
			text: 'Spielen, Basteln, Singen und draußen unterwegs sein – jede Woche mit deiner Gruppe.'
		},
		{
			title: 'Fahrten und Lager',
			text: 'Ob im Wald, am Lagerfeuer oder auf einem Zeltplatz – bei uns gibt es immer etwas zu erleben.'
		},
		{
			title: 'Echte Gemeinschaft',
			text: 'Abenteuer, Freundschaft und Verantwortung werden bei uns großgeschrieben.'
		}
	];
</script>

<Seo />

<!-- Hero -->
<section class="relative h-[70vh] max-h-[52rem] min-h-[26rem] w-full overflow-hidden bg-brand-900">
	<img
		src="/pfadfinder.avif"
		alt=""
		fetchpriority="high"
		class="absolute inset-0 h-full w-full object-cover brightness-75"
	/>
	<div
		class="absolute inset-0 bg-linear-to-t from-brand-950/60 via-brand-950/10 to-transparent"
	></div>
	<div class="absolute inset-0 flex items-center justify-center">
		<h1 class="sr-only">Stamm Edelweißpiraten in der Ev. Kirchengemeinde Bremen-Hastedt</h1>
		<StammHeader />
	</div>
</section>

<!-- Über uns -->
<section class="container-page section-y" aria-labelledby="ueber-uns">
	<div class="grid gap-10 lg:grid-cols-[3fr_2fr] lg:items-start">
		<div>
			<p class="eyebrow">Über uns</p>
			<h2 id="ueber-uns" class="mt-2 text-3xl sm:text-4xl">Pfadfinden in Bremen-Hastedt</h2>
			<div class="prose-site mt-6 text-lg">
				<p>
					Wir sind der <strong>Stamm Edelweißpiraten</strong> der Christlichen Pfadfinderschaft Deutschlands
					e.V. (CPD). Unser Zuhause ist Bremen-Hastedt, wo wir eng mit der Evangelischen Auferstehungsgemeinde
					zusammenarbeiten. Als Teil der CPD bieten wir Kindern und Jugendlichen eine lebendige Gemeinschaft,
					in der Abenteuer, Freundschaft und Verantwortung großgeschrieben werden.
				</p>
				<p>
					Neben unseren wöchentlichen Gruppenstunden unternehmen wir regelmäßig spannende Fahrten
					und Aktionen. Ob im Wald, am Lagerfeuer oder auf einem Zeltplatz – bei uns gibt es immer
					etwas zu erleben.
				</p>
				<p class="font-semibold text-brand-800">
					Jede und jeder ist willkommen – komm vorbei und mach mit!
				</p>
			</div>
		</div>
		<ul class="grid gap-4">
			{#each highlights as item (item.title)}
				<li class="rounded-card border border-line bg-surface p-5 shadow-card">
					<p class="font-semibold text-ink">{item.title}</p>
					<p class="mt-1 text-sm leading-relaxed text-muted">{item.text}</p>
				</li>
			{/each}
		</ul>
	</div>
</section>

<!-- Gruppen -->
<section class="border-y border-line bg-surface" aria-labelledby="gruppen-titel">
	<div class="container-page section-y">
		<div class="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<p class="eyebrow">Mitmachen</p>
				<h2 id="gruppen-titel" class="mt-2 text-3xl">Unsere Gruppen</h2>
				<p class="mt-2 max-w-2xl text-muted">
					In der Meute und in den Sippen treffen sich Kinder und Jugendliche in ihrem Alter – jede
					Woche zur Gruppenstunde.
				</p>
			</div>
			{#if data.groups.length > 0}
				<a href="/gruppen" class="btn btn-secondary shrink-0">Alle Gruppen</a>
			{/if}
		</div>
		<GroupGrid groups={data.groups} error={data.groupsError} />
	</div>
</section>

<!-- Termine -->
<div class="container-page section-y">
	<UpcomingEvents events={data.events} error={data.eventsError} />
</div>

<!-- Kontakt -->
<section class="container-page pb-4" aria-labelledby="kontakt-teaser">
	<div
		class="grid gap-8 rounded-card border border-brand-200 bg-brand-50 p-8 sm:p-10 md:grid-cols-[1fr_auto] md:items-center"
	>
		<div>
			<p class="eyebrow">Kontakt</p>
			<h2 id="kontakt-teaser" class="mt-2 text-2xl sm:text-3xl">Neugierig geworden?</h2>
			<p class="mt-3 max-w-2xl leading-relaxed text-ink/85">
				Du hast Fragen oder möchtest bei uns reinschnuppern? Melde dich gerne bei unseren
				Ansprechpartner*innen oder komm direkt zu einer Gruppenstunde vorbei.
			</p>
			<p class="mt-4 text-sm text-muted">
				Ev. Kirchengemeinde Bremen-Hastedt · Drakenburger Str. 42 · 28207 Bremen
			</p>
		</div>
		<div class="flex flex-col gap-3 sm:flex-row md:flex-col">
			<a href="/kontakt" class="btn btn-primary">Kontakt aufnehmen</a>
			<a href="/kontakt#treffpunkt" class="btn btn-secondary">Anfahrt ansehen</a>
		</div>
	</div>
</section>
