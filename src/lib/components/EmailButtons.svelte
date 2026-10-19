<script lang="ts">
	interface Props {
		email: string;
		/** Betreff für den Mail-Link */
		subject?: string;
		class?: string;
	}

	let { email, subject, class: className = '' }: Props = $props();

	let status = $state<'idle' | 'copied' | 'failed'>('idle');
	let timer: ReturnType<typeof setTimeout> | undefined;

	const href = $derived(
		`mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`
	);

	async function copy() {
		try {
			await navigator.clipboard.writeText(email);
			status = 'copied';
		} catch {
			status = 'failed';
		}
		clearTimeout(timer);
		timer = setTimeout(() => (status = 'idle'), 2500);
	}
</script>

<div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center {className}">
	<a {href} class="btn btn-primary">
		<svg
			class="size-5"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			aria-hidden="true"
		>
			<rect x="3" y="5" width="18" height="14" rx="2" />
			<path stroke-linecap="round" stroke-linejoin="round" d="m3 7 9 6 9-6" />
		</svg>
		E-Mail senden
	</a>
	<button type="button" class="btn btn-secondary" onclick={copy}>
		<svg
			class="size-5"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			aria-hidden="true"
		>
			{#if status === 'copied'}
				<path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7" />
			{:else}
				<rect x="9" y="9" width="12" height="12" rx="2" />
				<path stroke-linecap="round" stroke-linejoin="round" d="M5 15V5a2 2 0 0 1 2-2h10" />
			{/if}
		</svg>
		{status === 'copied' ? 'Kopiert!' : 'E-Mail kopieren'}
	</button>
	<span class="sr-only" aria-live="polite">
		{#if status === 'copied'}
			E-Mail-Adresse kopiert
		{:else if status === 'failed'}
			Kopieren nicht möglich
		{/if}
	</span>
	{#if status === 'failed'}
		<span class="text-sm text-muted select-all">{email}</span>
	{/if}
</div>
