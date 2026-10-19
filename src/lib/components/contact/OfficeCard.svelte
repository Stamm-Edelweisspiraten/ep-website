<script lang="ts">
	import EmailButtons from '$lib/components/EmailButtons.svelte';
	import { officeAvatarUrl } from '$lib/images';
	import type { WebsiteOffice } from '$lib/server/types';
	import { initials, sinceYear } from './contact';
	import ExpandableText from './ExpandableText.svelte';

	let { office }: { office: WebsiteOffice } = $props();

	const headingId = $derived(`amt-${office.id}`);
</script>

<article
	class="flex h-full flex-col rounded-card border border-line bg-surface p-6 shadow-card"
	aria-labelledby={headingId}
>
	<h3 id={headingId} class="text-xl">{office.name}</h3>
	{#if office.description}
		<ExpandableText text={office.description} class="mt-2 text-muted" />
	{/if}

	{#if office.holders.length > 0}
		<ul class="mt-5 space-y-5">
			{#each office.holders as holder (holder.id)}
				{@const avatar = officeAvatarUrl(holder)}
				{@const year = sinceYear(holder.since)}
				<li class="flex gap-4">
					{#if avatar}
						<img
							src={avatar}
							alt=""
							width="56"
							height="56"
							loading="lazy"
							decoding="async"
							class="size-14 shrink-0 rounded-full border border-line bg-brand-50 object-cover"
						/>
					{:else}
						<span
							class="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-800"
							aria-hidden="true"
						>
							{initials(holder.name)}
						</span>
					{/if}
					<div class="min-w-0">
						<p class="font-semibold text-ink">{holder.name}</p>
						{#if year}<p class="text-sm text-muted">seit {year}</p>{/if}
						{#if holder.bio}
							<ExpandableText text={holder.bio} class="mt-2 text-sm leading-relaxed text-ink/85" />
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	{/if}

	{#if office.emails.length > 0}
		<div class="mt-auto space-y-4 border-t border-line pt-5 {office.holders.length ? 'mt-6' : ''}">
			{#each office.emails as mail (mail.email)}
				<div>
					<p class="text-sm text-muted">{mail.label ?? 'E-Mail'}</p>
					<p class="font-medium break-all">{mail.email}</p>
					<EmailButtons email={mail.email} subject="Anfrage an: {office.name}" class="mt-3" />
				</div>
			{/each}
		</div>
	{/if}
</article>
