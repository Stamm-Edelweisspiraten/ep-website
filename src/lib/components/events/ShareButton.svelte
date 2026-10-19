<script lang="ts">
	/**
	 * Teilen: Web Share API (Handy), sonst Link in die Zwischenablage. Ohne `url` die aktuelle Seite.
	 */
	import { page } from '$app/state';

	let {
		title,
		text = '',
		url = null,
		variant = 'link',
		class: className = ''
	}: {
		title: string;
		text?: string;
		url?: string | null;
		/** `link`: kleine Pille, `button`: Schaltfläche */
		variant?: 'link' | 'button';
		class?: string;
	} = $props();

	let status = $state('');
	let timer: ReturnType<typeof setTimeout> | undefined;

	function show(message: string) {
		status = message;
		clearTimeout(timer);
		timer = setTimeout(() => (status = ''), 4000);
	}

	async function copy(href: string) {
		try {
			await navigator.clipboard.writeText(href);
			show('Link kopiert');
		} catch {
			window.prompt('Link zum Kopieren:', href);
		}
	}

	async function share() {
		const href = url ?? page.url.href;
		if (typeof navigator.share === 'function') {
			try {
				await navigator.share({ title, text: text || undefined, url: href });
				return;
			} catch (err) {
				// Abbruch durch die Nutzerin/den Nutzer → nichts tun
				if (err instanceof DOMException && err.name === 'AbortError') return;
			}
		}
		await copy(href);
	}

	$effect(() => () => clearTimeout(timer));
</script>

<div class="inline-flex items-center gap-3 {className}">
	<button
		type="button"
		class={variant === 'link'
			? 'inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line bg-white px-3.5 text-sm font-semibold text-ink transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800'
			: 'btn btn-secondary'}
		onclick={share}
	>
		<svg
			class="size-4"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			aria-hidden="true"
		>
			<circle cx="18" cy="5" r="3" />
			<circle cx="6" cy="12" r="3" />
			<circle cx="18" cy="19" r="3" />
			<path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
		</svg>
		Teilen
	</button>
	<span class="text-sm text-muted" role="status" aria-live="polite">{status}</span>
</div>
