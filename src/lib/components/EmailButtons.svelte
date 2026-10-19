<script lang="ts">
	import { safeColor } from '$lib/format';

	interface Props {
		email: string;
		/** Betreff für den Mail-Link */
		subject?: string;
		/** Optional Gruppenfarbe `#rrggbb` für „E-Mail senden“ (sonst Wappenblau) */
		color?: string | null;
		class?: string;
	}

	let { email, subject, color = null, class: className = '' }: Props = $props();

	let status = $state<'idle' | 'copied' | 'failed'>('idle');
	let timer: ReturnType<typeof setTimeout> | undefined;

	const href = $derived(
		`mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`
	);
	const accent = $derived(safeColor(color));

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
	<a {href} class="send btn btn-primary" style:--accent={accent} class:custom={!!accent}>
		<svg
			class="size-5"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			aria-hidden="true"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="M4 4h16v16H4z" />
			<path stroke-linecap="round" stroke-linejoin="round" d="M22 6 12 13 2 6" />
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
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M8 16h8M8 12h8M8 8h8M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
				/>
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

<style>
	/* Gruppenfarbe: etwas abgedunkelt, damit weiße Schrift lesbar bleibt */
	.send.custom {
		background-color: color-mix(in srgb, var(--accent) 85%, black);
	}
	.send.custom:hover {
		background-color: color-mix(in srgb, var(--accent) 70%, black);
	}
</style>
