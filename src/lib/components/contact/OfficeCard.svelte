<script lang="ts">
	/**
	 * Amt als Kontaktkasten wie auf der alten Kontaktseite („Stammesführung“): Name, Ansprechpartner*innen,
	 * E-Mail-Adressen des Amts mit „E-Mail senden/kopieren“. Fotos und Beschreibungen der Personen
	 * stehen auf der Teamseite.
	 */
	import EmailButtons from '$lib/components/EmailButtons.svelte';
	import { joinNames } from '$lib/components/groups/groups';
	import type { WebsiteOffice } from '$lib/server/types';
	import ContactBox from './ContactBox.svelte';
	import ExpandableText from './ExpandableText.svelte';

	interface Props {
		office: WebsiteOffice;
		/** Kastenfarbe `#rrggbb` (Standard: Rot wie „Stammesführung“ auf der alten Seite) */
		color?: string;
	}

	const OFFICE_COLOR = '#dc2626';

	let { office, color = OFFICE_COLOR }: Props = $props();

	const names = $derived(joinNames(office.holders.map((h) => h.name)));
</script>

<ContactBox title={office.name} {color}>
	{#if office.description}
		<ExpandableText text={office.description} class="mt-1 text-sm" />
	{/if}
	{#if names}
		<p class="mt-1"><span class="font-bold">Ansprechpartner*innen</span><br />{names}</p>
	{/if}
	{#each office.emails as mail (mail.email)}
		<p class="mt-1">
			<span class="font-bold">{mail.label ?? 'E-Mail'}</span><br /><span class="break-all"
				>{mail.email}</span
			>
		</p>
		<EmailButtons
			email={mail.email}
			subject="Anfrage an: {office.name}"
			{color}
			class="mt-4 mb-2"
		/>
	{/each}
</ContactBox>
