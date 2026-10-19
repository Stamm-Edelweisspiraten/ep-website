<script lang="ts">
	import { formatMeeting } from '$lib/format';
	import type { WebsiteGroup } from '$lib/server/types';
	import { GROUP_TYPE_LABELS, GROUP_TYPE_LEADS, groupColor, groupImage } from './groups';

	interface Props {
		group: WebsiteGroup;
		/** Überschriften-Ebene (Standard `h3`) */
		heading?: 'h2' | 'h3';
	}

	let { group, heading = 'h3' }: Props = $props();

	const color = $derived(groupColor(group));
	const image = $derived(groupImage(group));
	const meeting = $derived(
		formatMeeting(group.meetingWeekday, group.meetingTime, group.meetingEndTime)
	);
	const typeLabel = $derived(GROUP_TYPE_LABELS[group.type] ?? 'Gruppe');
</script>

<!-- Ganze Karte klickbar (Link der Überschrift überdeckt die Karte); Farbe = Gruppenfarbe -->
<article
	class="group-card card card-hover group relative flex h-full flex-col overflow-hidden"
	style:--group-color={color}
>
	<div class="group-media relative flex aspect-[16/10] items-center justify-center overflow-hidden">
		{#if image}
			<img
				src={image}
				alt=""
				loading="lazy"
				decoding="async"
				class="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
			/>
		{:else}
			<img src="/kreuzlilie.avif" alt="" class="h-1/2 w-auto opacity-30" />
		{/if}
		<span
			class="group-badge absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase"
		>
			{typeLabel}{#if group.ageRange}&nbsp;· {group.ageRange}{/if}
		</span>
	</div>
	<div class="flex flex-1 flex-col p-5 sm:p-6">
		<svelte:element this={heading} class="text-xl font-bold">
			<a
				href="/gruppen/{group.slug}"
				class="group-title after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
			>
				{group.name}
			</a>
		</svelte:element>
		<p class="mt-2 text-sm leading-relaxed text-muted">{GROUP_TYPE_LEADS[group.type] ?? ''}</p>
		{#if meeting || group.meetingPlace}
			<dl class="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
				{#if meeting}
					<div class="flex gap-2">
						<dt class="sr-only">Gruppenstunde</dt>
						<svg
							class="group-icon mt-0.5 size-4 shrink-0"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							aria-hidden="true"
						>
							<circle cx="12" cy="12" r="9" />
							<path stroke-linecap="round" d="M12 7v5l3 2" />
						</svg>
						<dd class="text-ink">{meeting}</dd>
					</div>
				{/if}
				{#if group.meetingPlace}
					<div class="flex gap-2">
						<dt class="sr-only">Ort</dt>
						<svg
							class="group-icon mt-0.5 size-4 shrink-0"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							aria-hidden="true"
						>
							<path
								stroke-linejoin="round"
								d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"
							/>
							<circle cx="12" cy="9.5" r="2.5" />
						</svg>
						<dd class="text-muted">{group.meetingPlace}</dd>
					</div>
				{/if}
			</dl>
		{/if}
		<p
			class="group-more mt-auto flex items-center gap-1.5 pt-5 text-sm font-semibold"
			aria-hidden="true"
		>
			Mehr zur {typeLabel} <span class="transition-transform group-hover:translate-x-1">→</span>
		</p>
	</div>
</article>

<style>
	/* Varianten der Gruppenfarbe */
	.group-card {
		border-top: 4px solid var(--group-color);
	}
	.group-media {
		background-color: color-mix(in srgb, var(--group-color) 9%, white);
	}
	.group-badge {
		background-color: white;
		color: color-mix(in srgb, var(--group-color) 75%, black);
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.08);
	}
	.group-title,
	.group-more,
	.group-icon {
		color: color-mix(in srgb, var(--group-color) 75%, black);
	}
	.group-card:has(.group-title:focus-visible) {
		outline: 2px solid var(--color-brand-600);
		outline-offset: 2px;
	}
</style>
