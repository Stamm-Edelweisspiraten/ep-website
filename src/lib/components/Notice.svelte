<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Überschrift; `''` blendet sie aus */
		title?: string;
		/** Text; Standard: Bitte um späteren Versuch */
		message?: string;
		tone?: 'warning' | 'info';
		/** Ersetzt `message` */
		children?: Snippet;
		class?: string;
	}

	let {
		title = 'Inhalte konnten gerade nicht geladen werden',
		message = 'Bitte versuche es in ein paar Minuten noch einmal.',
		tone = 'warning',
		children,
		class: className = ''
	}: Props = $props();

	const styles = $derived(
		tone === 'warning'
			? 'border-amber-200 bg-amber-50 text-amber-900'
			: 'border-brand-100 bg-brand-50 text-ink'
	);
</script>

<div class="flex gap-3 rounded-card border p-4 sm:p-5 {styles} {className}" role="status">
	<svg
		class="mt-0.5 size-5 shrink-0"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		aria-hidden="true"
	>
		{#if tone === 'warning'}
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
			/>
		{:else}
			<circle cx="12" cy="12" r="9" />
			<path stroke-linecap="round" d="M12 11v5m0-8h.01" />
		{/if}
	</svg>
	<div class="leading-relaxed">
		{#if title}<p class="font-semibold">{title}</p>{/if}
		{#if children}
			{@render children()}
		{:else if message}
			<p class={title ? 'mt-1 text-sm' : ''}>{message}</p>
		{/if}
	</div>
</div>
