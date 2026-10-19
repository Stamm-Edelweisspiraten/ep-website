<script lang="ts">
	import Notice from '$lib/components/Notice.svelte';
	import type { WebsiteGroup } from '$lib/server/types';
	import GroupCard from './GroupCard.svelte';

	interface Props {
		groups: WebsiteGroup[];
		/** Laden fehlgeschlagen */
		error?: boolean;
		heading?: 'h2' | 'h3';
	}

	let { groups, error = false, heading = 'h3' }: Props = $props();
</script>

{#if groups.length > 0}
	<ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each groups as group (group.id)}
			<li class="h-full"><GroupCard {group} {heading} /></li>
		{/each}
	</ul>
{:else if error}
	<Notice
		title="Unsere Gruppen konnten gerade nicht geladen werden"
		message="Bitte versuche es später noch einmal – oder schreib uns über die Kontaktseite."
	/>
{:else}
	<Notice tone="info" title="">
		<p>
			Die Gruppen stellen sich hier bald vor. Bis dahin erreichst du uns über die
			<a class="link" href="/kontakt">Kontaktseite</a>.
		</p>
	</Notice>
{/if}
