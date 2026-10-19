<script lang="ts">
	/** Person im Team: Profilbild (Proxy) oder Initialen, Name, Ämter mit „seit“, Beschreibung aufklappbar. */
	import { officeAvatarUrl } from '$lib/images';
	import { initials, sinceYear, type TeamMember } from './contact';
	import ExpandableText from './ExpandableText.svelte';

	let { member }: { member: TeamMember } = $props();

	const avatar = $derived(officeAvatarUrl(member));
	const headingId = $derived(`person-${member.id}`);
</script>

<article class="card flex h-full gap-4 p-6 sm:gap-5" aria-labelledby={headingId}>
	{#if avatar}
		<img
			src={avatar}
			alt="Foto von {member.name}"
			width="80"
			height="80"
			loading="lazy"
			decoding="async"
			class="size-16 shrink-0 rounded-full bg-soft object-cover ring-4 ring-brand-50 sm:size-20"
		/>
	{:else}
		<span
			class="flex size-16 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-100 to-brand-200 text-xl font-bold text-brand-800 ring-4 ring-brand-50 sm:size-20"
			aria-hidden="true"
		>
			{initials(member.name)}
		</span>
	{/if}
	<div class="min-w-0 flex-1">
		<h3 id={headingId} class="text-lg font-bold">{member.name}</h3>
		<ul class="mt-2 flex flex-wrap gap-1.5">
			{#each member.offices as office (office.id)}
				{@const year = sinceYear(office.since)}
				<li
					class="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800"
				>
					{office.name}
					{#if year}<span class="font-normal text-brand-600">&nbsp;· seit {year}</span>{/if}
				</li>
			{/each}
		</ul>
		{#if member.bio}
			<ExpandableText text={member.bio} class="mt-3 text-sm leading-relaxed text-muted" />
		{/if}
	</div>
</article>
