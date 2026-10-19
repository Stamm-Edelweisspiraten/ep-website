<script lang="ts">
	import UpcomingEvents from '$lib/components/events/UpcomingEvents.svelte';
	import GroupGrid from '$lib/components/groups/GroupGrid.svelte';
	import Map from '$lib/components/Map.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import StammHeader from '$lib/components/StammHeader.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Seo />

<!-- Hero (wie die alte Website) -->
<section class="relative h-[70vh] w-full overflow-hidden bg-gray-800">
	<img
		src="/pfadfinder.avif"
		alt=""
		fetchpriority="high"
		class="absolute inset-0 h-full w-full object-cover brightness-75"
	/>
	<div class="absolute inset-0 flex items-center justify-center">
		<h1 class="sr-only">Stamm Edelweißpiraten in der Ev. Kirchengemeinde Bremen-Hastedt</h1>
		<StammHeader />
	</div>
</section>

<!-- Unsere Gruppen -->
<section class="container-page py-12" aria-labelledby="gruppen-titel">
	<div class="mb-6 flex flex-wrap items-end justify-between gap-3">
		<h2 id="gruppen-titel" class="text-3xl font-bold text-gray-800">Unsere Gruppen</h2>
		{#if data.groups.length > 0}
			<a href="/gruppen" class="text-gray-700 hover:text-blue-600 hover:underline">
				Alle Gruppen <span aria-hidden="true">→</span>
			</a>
		{/if}
	</div>
	<GroupGrid groups={data.groups} error={data.groupsError} />
</section>

<!-- Über uns -->
<section class="container-page space-y-6 py-12" aria-labelledby="ueber-uns">
	<h2 id="ueber-uns" class="text-3xl font-bold text-gray-800">Über uns</h2>
	<p class="leading-relaxed text-gray-700 hyphens-auto sm:text-justify">
		Wir sind der <strong>Stamm Edelweißpiraten</strong> der Christlichen Pfadfinderschaft Deutschlands
		e.V. (CPD). Unser Zuhause ist Bremen-Hastedt, wo wir eng mit der Evangelischen Auferstehungsgemeinde
		zusammenarbeiten. Als Teil der CPD bieten wir Kindern und Jugendlichen eine lebendige Gemeinschaft,
		in der Abenteuer, Freundschaft und Verantwortung großgeschrieben werden.
	</p>
	<p class="leading-relaxed text-gray-700 hyphens-auto sm:text-justify">
		Neben unseren wöchentlichen Gruppenstunden unternehmen wir regelmäßig spannende Fahrten und
		Aktionen. Ob im Wald, am Lagerfeuer oder auf einem Zeltplatz – bei uns gibt es immer etwas zu
		erleben.
	</p>
	<p class="font-bold text-gray-800">Jede und jeder ist willkommen – komm vorbei und mach mit!</p>
</section>

<!-- Nächste Termine -->
<div class="container-page py-12">
	<UpcomingEvents events={data.events} error={data.eventsError} />
</div>

<!-- Treffpunkt -->
<section class="container-page py-12" aria-labelledby="treffpunkt-titel">
	<h2 id="treffpunkt-titel" class="mb-6 text-3xl font-bold text-gray-800">Hier findest du uns</h2>
	<p class="mb-4 text-gray-700">
		Ev. Kirchengemeinde Bremen-Hastedt · Drakenburger Str. 42 · 28207 Bremen
	</p>
	<Map />
</section>
