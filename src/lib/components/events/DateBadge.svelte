<script lang="ts">
	/** Datums-Kachel wie ein Abreißkalender: Monat oben, Tag groß, Wochentag klein. */
	import { dateParts } from '$lib/format';

	let { date, class: className = '' }: { date: string; class?: string } = $props();

	const parts = $derived(dateParts(date));
</script>

{#if parts}
	<div
		class="flex w-14 shrink-0 flex-col self-start overflow-hidden rounded-xl border border-line bg-white text-center shadow-sm {className}"
		aria-hidden="true"
	>
		<span class="bg-brand-700 py-0.5 text-[0.65rem] font-bold tracking-wider text-white uppercase">
			{parts.month}
		</span>
		<span class="pt-1 text-xl leading-none font-extrabold text-ink">{parts.day}</span>
		<span class="pb-1.5 text-[0.65rem] font-medium text-muted">{parts.weekday}</span>
	</div>
{/if}
