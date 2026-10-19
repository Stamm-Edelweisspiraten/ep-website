<script lang="ts">
	/**
	 * Amt als Kontaktkasten: Name, Ansprechpartner*innen,
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
		/** Kastenfarbe `#rrggbb` (Standard: Wappenrot) */
		color?: string;
	}

	const OFFICE_COLOR = '#c62828';

	let { office, color = OFFICE_COLOR }: Props = $props();

	const names = $derived(joinNames(office.holders.map((h) => h.name)));
</script>

<ContactBox title={office.name} {color} class="h-full">
	{#if office.description}
		<ExpandableText text={office.description} class="mt-1 text-sm" />
	{/if}
	{#if names}
		<p class="mt-3">
			<span class="block text-xs font-semibold tracking-wide text-muted uppercase"
				>Ansprechpartner*innen</span
			>
			<span class="font-semibold text-ink">{names}</span>
		</p>
	{/if}
	{#each office.emails as mail (mail.email)}
		<p class="mt-3">
			<span class="block text-xs font-semibold tracking-wide text-muted uppercase"
				>{mail.label ?? 'E-Mail'}</span
			>
			<span class="break-all text-ink">{mail.email}</span>
		</p>
		<EmailButtons email={mail.email} subject="Anfrage an: {office.name}" {color} class="mt-4" />
	{/each}
</ContactBox>
