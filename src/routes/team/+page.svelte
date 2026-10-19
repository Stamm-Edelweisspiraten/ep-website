<script lang="ts">
	/**
	 * „Unser Team“: alle Personen mit Ämtern (eine Karte je Person mit allen ihren Ämtern) und die
	 * Gruppenleitungen je Gruppe (nur Vornamen, wie die API sie liefert).
	 */
	import ContactBox from '$lib/components/contact/ContactBox.svelte';
	import { initials, teamMembers, vacantOffices } from '$lib/components/contact/contact';
	import PersonCard from '$lib/components/contact/PersonCard.svelte';
	import { groupColor, groupTitle } from '$lib/components/groups/groups';
	import Notice from '$lib/components/Notice.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const members = $derived(teamMembers(data.offices));
	const vacant = $derived(vacantOffices(data.offices));
	const groups = $derived(data.groups.filter((g) => g.leaders.length > 0));
</script>

<Seo
	title="Team"
	description="Das Team des Stamms Edelweißpiraten in Bremen-Hastedt: Ämter, Ansprechpartner*innen und Gruppenleitungen."
/>

<PageHeader
	title="Unser Team"
	lead="Hinter dem Stamm stehen viele Ehrenamtliche. Hier stellen sich die Menschen vor, die bei uns ein Amt übernommen haben, und die Leitungen unserer Gruppen."
/>

<div class="container-page section-y space-y-14">
	<!-- Ämter -->
	<section aria-labelledby="aemter-titel" class="space-y-6">
		<h2 id="aemter-titel" class="text-2xl font-bold text-gray-800">Ämter</h2>
		{#if members.length > 0}
			<ul class="grid grid-cols-1 gap-6 md:grid-cols-2">
				{#each members as member (member.id)}
					<li><PersonCard {member} /></li>
				{/each}
			</ul>
		{/if}
		{#if data.officesError}
			<Notice
				title="Das Team konnte gerade nicht vollständig geladen werden"
				message="Bitte versuche es in ein paar Minuten noch einmal – oder schreib uns über die Kontaktseite."
			/>
		{:else if members.length === 0}
			<Notice tone="info" title="">
				<p>
					Unser Team stellt sich hier bald vor. Bis dahin erreichst du uns über die
					<a class="link" href="/kontakt">Kontaktseite</a>.
				</p>
			</Notice>
		{/if}
		{#if vacant.length > 0 && members.length > 0}
			<p class="text-sm text-gray-500">
				Derzeit nicht besetzt: {vacant.map((o) => o.name).join(', ')}. Du hast Lust, mitzumachen?
				<a class="link" href="/kontakt">Sprich uns an</a>.
			</p>
		{/if}
	</section>

	<!-- Gruppenleitungen -->
	<section aria-labelledby="leitungen-titel" class="space-y-6">
		<h2 id="leitungen-titel" class="text-2xl font-bold text-gray-800">Gruppenleitungen</h2>
		{#if groups.length > 0}
			<ul class="grid grid-cols-1 gap-6 md:grid-cols-2">
				{#each groups as group (group.id)}
					<li class="h-full">
						<ContactBox title={groupTitle(group)} color={group.color} class="h-full">
							{#snippet subtitle()}
								<p class="text-sm text-gray-600">
									<a
										class="underline underline-offset-4 hover:text-gray-900"
										href="/gruppen/{group.slug}">{group.name}</a
									>
								</p>
							{/snippet}
							<ul class="mt-4 flex flex-wrap gap-3" aria-label="Leitung der Gruppe {group.name}">
								{#each group.leaders as leader, i (`${leader.firstName}-${i}`)}
									<li class="flex items-center gap-2">
										<span
											class="leader-initial flex size-9 items-center justify-center rounded-full text-sm font-bold text-white"
											style:--leader-color={groupColor(group)}
											aria-hidden="true"
										>
											{initials(leader.firstName)}
										</span>
										<span class="font-medium text-gray-800">{leader.firstName}</span>
									</li>
								{/each}
							</ul>
						</ContactBox>
					</li>
				{/each}
			</ul>
		{:else if data.groupsError}
			<Notice
				title="Die Gruppenleitungen konnten gerade nicht geladen werden"
				message="Bitte versuche es in ein paar Minuten noch einmal."
			/>
		{:else}
			<Notice tone="info" title="">
				<p>
					Die Gruppen stellen sich bald vor. Alles zu unseren Gruppenstunden findest du unter
					<a class="link" href="/gruppen">Gruppen</a>.
				</p>
			</Notice>
		{/if}
	</section>
</div>

<style>
	/* Initialen der Leitung in abgedunkelter Gruppenfarbe (weiße Schrift bleibt lesbar) */
	.leader-initial {
		background-color: color-mix(in srgb, var(--leader-color) 80%, black);
	}
</style>
