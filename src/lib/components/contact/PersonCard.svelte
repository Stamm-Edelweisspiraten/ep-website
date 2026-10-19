<script lang="ts">
	/** Person im Team: Profilbild (Proxy) oder Initialen, Name, Ämter mit „seit“, Beschreibung aufklappbar. */
	import { officeAvatarUrl } from '$lib/images';
	import { initials, sinceYear, type TeamMember } from './contact';
	import ExpandableText from './ExpandableText.svelte';

	let { member }: { member: TeamMember } = $props();

	const avatar = $derived(officeAvatarUrl(member));
	const headingId = $derived(`person-${member.id}`);
</script>

<article
	class="flex h-full gap-4 border border-gray-300 bg-white p-6 sm:gap-5"
	aria-labelledby={headingId}
>
	{#if avatar}
		<img
			src={avatar}
			alt="Foto von {member.name}"
			width="80"
			height="80"
			loading="lazy"
			decoding="async"
			class="size-16 shrink-0 rounded-full border border-gray-200 bg-gray-100 object-cover sm:size-20"
		/>
	{:else}
		<span
			class="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-900 sm:size-20"
			aria-hidden="true"
		>
			{initials(member.name)}
		</span>
	{/if}
	<div class="min-w-0 flex-1">
		<h3 id={headingId} class="text-lg font-bold text-gray-800">{member.name}</h3>
		<ul class="mt-1 space-y-0.5">
			{#each member.offices as office (office.id)}
				{@const year = sinceYear(office.since)}
				<li class="text-sm">
					<span class="font-medium text-gray-700">{office.name}</span>
					{#if year}<span class="text-gray-500"> · seit {year}</span>{/if}
				</li>
			{/each}
		</ul>
		{#if member.bio}
			<ExpandableText text={member.bio} class="mt-3 text-sm leading-relaxed text-gray-700" />
		{/if}
	</div>
</article>
