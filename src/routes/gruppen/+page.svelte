<script lang="ts">
	import GroupGrid from '$lib/components/groups/GroupGrid.svelte';
	import { groupSections } from '$lib/components/groups/groups';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const sections = $derived(groupSections(data.groups));

	const SECTION_LEADS: Record<string, string> = {
		meute:
			'In der Meute wird gespielt, gebastelt, gesungen und draußen getobt – für Kinder im Grundschulalter.',
		sippe:
			'In den Sippen geht es auf Fahrt und ins Zeltlager: Abenteuer und echte Gemeinschaft mit Gleichaltrigen.'
	};
</script>

<Seo
	title="Gruppen"
	description="Meute und Sippen der Edelweißpiraten in Bremen-Hastedt: Gruppenstunden, Alter, Leitung und Treffpunkt."
/>

<PageHeader
	title="Unsere Gruppen"
	lead="Jede Woche treffen sich unsere Gruppen zur Gruppenstunde. Such dir die passende aus und komm einfach vorbei – Schnuppern ist jederzeit möglich."
/>

<div class="container-page section-y space-y-12">
	{#if sections.length === 0}
		<GroupGrid groups={[]} error={data.groupsError} heading="h2" />
	{:else}
		{#each sections as section (section.type)}
			<section aria-labelledby="abschnitt-{section.type}">
				<h2 id="abschnitt-{section.type}" class="text-2xl font-bold text-gray-800">
					{section.label}
				</h2>
				{#if SECTION_LEADS[section.type]}
					<p class="mt-2 mb-6 leading-relaxed text-gray-700">{SECTION_LEADS[section.type]}</p>
				{/if}
				<GroupGrid groups={section.groups} />
			</section>
		{/each}
	{/if}
</div>
