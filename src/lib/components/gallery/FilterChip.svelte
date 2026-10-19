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
	class="inline-flex min-h-9 items-center justify-center gap-1.5 border px-3 py-1.5 text-sm transition-colors {active
		? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
		: 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'} {className}"
>
	{@render children()}
	{#if count !== null && count > 0}
		<span class="px-1 text-xs {active ? 'text-white/80' : 'text-gray-500'}">
			{count}
		</span>
	{/if}
</a>
