<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import { formatMeeting, safeColor } from '$lib/format';
	import type { WebsiteGroup } from '$lib/server/types';
	import { GROUP_TYPE_LABELS, GROUP_TYPE_LEADS, groupImage } from './groups';

	interface Props {
		group: WebsiteGroup;
		/** Überschriften-Ebene des Gruppennamens (Standard `h3`) */
		heading?: 'h2' | 'h3';
	}

	let { group, heading = 'h3' }: Props = $props();

	const image = $derived(groupImage(group));
	const color = $derived(safeColor(group.color));
	const meeting = $derived(formatMeeting(group.meetingWeekday, group.meetingTime));
	const typeLabel = $derived(GROUP_TYPE_LABELS[group.type] ?? 'Gruppe');
</script>

<Card href="/gruppen/{group.slug}" padded={false} class="group/card flex h-full flex-col">
	<div class="h-1.5 w-full bg-brand-500" style:background-color={color} aria-hidden="true"></div>
	{#if image}
		<div class="aspect-[4/3] overflow-hidden bg-brand-50">
			<img
				src={image}
				alt=""
				loading="lazy"
				decoding="async"
				class="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover/card:scale-100"
			/>
		</div>
	{/if}
	<div class="flex grow flex-col p-6">
		<p class="flex flex-wrap items-center gap-2 text-sm">
			<span
				class="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-0.5 font-semibold text-brand-800"
			>
				<span
					class="size-2 rounded-full bg-brand-500"
					style:background-color={color}
					aria-hidden="true"
				></span>
				{typeLabel}
			</span>
			{#if group.ageRange}
				<span class="text-muted">{group.ageRange}</span>
			{/if}
		</p>
		<svelte:element this={heading} class="mt-3 text-xl">{group.name}</svelte:element>
		<p class="mt-2 text-muted">{GROUP_TYPE_LEADS[group.type] ?? ''}</p>
		{#if meeting || group.meetingPlace}
			<p class="mt-4 flex items-start gap-2 text-sm text-ink/80">
				<svg
					class="mt-0.5 size-4 shrink-0 text-brand-700"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					aria-hidden="true"
				>
					<circle cx="12" cy="12" r="9" />
					<path stroke-linecap="round" d="M12 7v5l3 2" />
				</svg>
				<span>
					{#if meeting}<span class="font-medium">{meeting}</span>{/if}
					{#if meeting && group.meetingPlace}<span aria-hidden="true"> · </span>{/if}
					{#if group.meetingPlace}<span>{group.meetingPlace}</span>{/if}
				</span>
			</p>
		{/if}
		<span class="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold text-brand-700">
			Mehr erfahren
			<svg
				class="size-4 transition-transform group-hover/card:translate-x-0.5 motion-reduce:transition-none"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				aria-hidden="true"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
			</svg>
		</span>
	</div>
</Card>
