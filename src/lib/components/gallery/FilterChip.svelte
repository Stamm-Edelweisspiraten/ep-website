<script lang="ts">
	/**
	 * Filter-Chip als Link (funktioniert ohne JavaScript, Zustand steht in der URL).
	 * Aktiver Chip: `aria-current` (`true` bzw. `page` für Seitenzahlen).
	 */
	import type { Snippet } from 'svelte';

	let {
		href,
		active = false,
		current = 'true',
		count = null,
		replaceState = true,
		keepPosition = true,
		label,
		class: className = '',
		children
	}: {
		href: string;
		active?: boolean;
		/** Wert für `aria-current`, wenn aktiv */
		current?: 'true' | 'page';
		/** Anzahl als kleines Badge */
		count?: number | null;
		/** Verlaufseintrag ersetzen statt anlegen (Filter) */
		replaceState?: boolean;
		/** Scrollposition und Fokus behalten (Filter); `false` für Seitenwechsel */
		keepPosition?: boolean;
		label?: string;
		class?: string;
		children: Snippet;
	} = $props();
</script>

<a
	{href}
	aria-current={active ? current : undefined}
	aria-label={label}
	data-sveltekit-noscroll={keepPosition ? '' : 'off'}
	data-sveltekit-keepfocus={keepPosition ? '' : 'off'}
	data-sveltekit-replacestate={replaceState ? '' : 'off'}
	class="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors {active
		? 'border-brand-700 bg-brand-700 text-white hover:bg-brand-800'
		: 'border-line bg-white text-ink hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800'} {className}"
>
	{@render children()}
	{#if count !== null && count > 0}
		<span
			class="rounded-full px-1.5 text-xs {active ? 'bg-white/20 text-white' : 'bg-soft text-muted'}"
		>
			{count}
		</span>
	{/if}
</a>
