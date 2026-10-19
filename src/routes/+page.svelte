<script lang="ts">
	import UpcomingEvents from '$lib/components/events/UpcomingEvents.svelte';
	import GroupGrid from '$lib/components/groups/GroupGrid.svelte';
	import Instagram from '$lib/components/Instagram.svelte';
	import Map from '$lib/components/Map.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import StammHeader from '$lib/components/StammHeader.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const highlights = [
		{
			title: 'Jede Woche Gruppenstunde',
			text: 'Spielen, basteln, singen und draußen unterwegs sein – in festen Gruppen nach Alter.',
			icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v5l3 2'
		},
		{
			title: 'Fahrten und Lager',
			text: 'Zelten, Lagerfeuer, Geländespiele: Wochenenden und Sommerfahrten mit dem ganzen Stamm.',
			icon: 'M3 20h18M5 20l7-14 7 14M12 6v14'
		},
		{
			title: 'Teil der CPD',
			text: 'Wir gehören zur Christlichen Pfadfinderschaft Deutschlands und zur Gemeinde in Hastedt.',
			icon: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z'
		}
	];
</script>

<Seo />

<!-- Hero -->
<section
	class="relative isolate flex min-h-[78vh] w-full items-center overflow-hidden bg-brand-950"
>
	<img
		src="/pfadfinder.avif"
		alt=""
		fetchpriority="high"
		class="absolute inset-0 -z-10 h-full w-full object-cover"
	/>
	<div
		class="absolute inset-0 -z-10 bg-linear-to-b from-brand-950/55 via-brand-950/35 to-brand-950/80"
		aria-hidden="true"
	></div>
	<div class="container-page flex flex-col items-center py-20 text-center">
		<h1 class="sr-only">Stamm Edelweißpiraten in der Ev. Kirchengemeinde Bremen-Hastedt</h1>
		<StammHeader class="drop-shadow-[0_2px_12px_rgb(0_0_0/0.45)]" />
		<p class="mt-6 max-w-xl text-lg text-white/90 drop-shadow">
			Pfadfinden für Kinder und Jugendliche in Bremen-Hastedt – Abenteuer, Freundschaft und
			Verantwortung.
		</p>
		<div class="mt-8 flex flex-col gap-3 sm:flex-row">
			<a href="#gruppen" class="btn bg-white text-brand-800 shadow-lg hover:bg-brand-50">
				Gruppe finden
			</a>
			<a
				href="/termine"
				class="btn border border-white/50 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
			>
				Nächste Termine <span aria-hidden="true">→</span>
			</a>
		</div>
	</div>
</section>

<!-- Über uns -->
<section class="container-page section-y" aria-labelledby="ueber-uns">
	<div class="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
		<div>
			<p class="eyebrow mb-2">Wer wir sind</p>
			<h2 id="ueber-uns" class="section-title">Über uns</h2>
			<div class="mt-6 space-y-4 text-lg leading-relaxed text-gray-700">
				<p>
					Wir sind der <strong class="text-ink">Stamm Edelweißpiraten</strong> der Christlichen Pfadfinderschaft
					Deutschlands e.V. (CPD). Unser Zuhause ist Bremen-Hastedt, wo wir eng mit der Evangelischen
					Auferstehungsgemeinde zusammenarbeiten. Als Teil der CPD bieten wir Kindern und Jugendlichen
					eine lebendige Gemeinschaft, in der Abenteuer, Freundschaft und Verantwortung großgeschrieben
					werden.
				</p>
				<p>
					Neben unseren wöchentlichen Gruppenstunden unternehmen wir regelmäßig spannende Fahrten
					und Aktionen. Ob im Wald, am Lagerfeuer oder auf einem Zeltplatz – bei uns gibt es immer
					etwas zu erleben.
				</p>
			</div>
			<p class="mt-6 text-lg font-bold text-brand-800">
				Jede und jeder ist willkommen – komm vorbei und mach mit!
			</p>
		</div>
		<ul class="grid content-start gap-4">
			{#each highlights as item (item.title)}
				<li class="card flex gap-4 p-5">
					<span
						class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"
						aria-hidden="true"
					>
						<svg
							class="size-6"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d={item.icon} />
						</svg>
					</span>
					<div>
						<h3 class="font-bold">{item.title}</h3>
						<p class="mt-1 text-sm leading-relaxed text-muted">{item.text}</p>
					</div>
				</li>
			{/each}
		</ul>
	</div>
</section>

<!-- Unsere Gruppen -->
<section id="gruppen" class="border-y border-line bg-white" aria-labelledby="gruppen-titel">
	<div class="container-page section-y">
		<div class="mb-8 flex flex-wrap items-end justify-between gap-3">
			<div>
				<p class="eyebrow mb-2">Mitmachen</p>
				<h2 id="gruppen-titel" class="section-title">Unsere Gruppen</h2>
			</div>
			{#if data.groups.length > 0}
				<a href="/gruppen" class="link-more">Alle Gruppen <span aria-hidden="true">→</span></a>
			{/if}
		</div>
		<GroupGrid groups={data.groups} error={data.groupsError} />
	</div>
</section>

<!-- Nächste Termine -->
<div class="container-page section-y">
	<UpcomingEvents events={data.events} error={data.eventsError} />
</div>

<!-- Treffpunkt -->
<section class="container-page pb-12 sm:pb-16" aria-labelledby="treffpunkt-titel">
	<div class="grid gap-8 lg:grid-cols-[1fr_1.6fr] lg:items-center">
		<div>
			<p class="eyebrow mb-2">Treffpunkt</p>
			<h2 id="treffpunkt-titel" class="section-title">Hier findest du uns</h2>
			<address class="mt-5 text-lg leading-relaxed text-gray-700 not-italic">
				Ev. Kirchengemeinde Bremen-Hastedt<br />
				Drakenburger Str. 42<br />
				28207 Bremen
			</address>
			<div class="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
				<a href="/kontakt" class="btn btn-primary">Kontakt aufnehmen</a>
				<a href="/team" class="btn btn-secondary">Unser Team</a>
			</div>
		</div>
		<Map class="h-[340px] sm:h-[400px]" />
	</div>
</section>

<div class="container-page pb-4">
	<Instagram />
</div>
