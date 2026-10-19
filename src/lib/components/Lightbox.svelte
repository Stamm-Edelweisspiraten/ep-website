<script lang="ts" module>
	export interface LightboxImage {
		id: string;
		/** Große Variante (`web`) */
		src: string;
		alt: string;
		description: string | null;
		width: number;
		height: number;
	}
</script>

<script lang="ts">
	/**
	 * Vollbild-Bildansicht: Pfeile/Tastatur (←/→/Esc), Wischen, Fokusfalle, Zähler,
	 * Vorladen der Nachbarbilder. Die Seite rendert sie nur, solange sie offen ist.
	 */
	import { onMount } from 'svelte';

	let {
		images,
		index = $bindable(0),
		title,
		onclose
	}: {
		images: LightboxImage[];
		index?: number;
		/** Name der Galerie (für den Dialog-Namen) */
		title: string;
		onclose: () => void;
	} = $props();

	let dialog: HTMLDivElement | undefined = $state();
	let closeButton: HTMLButtonElement | undefined = $state();

	const count = $derived(images.length);
	const image = $derived(images[index] ?? images[0]);
	const descriptionId = $props.id();

	function go(delta: number) {
		if (count < 2) return;
		index = (index + delta + count) % count;
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			onclose();
		} else if (event.key === 'ArrowRight') {
			event.preventDefault();
			go(1);
		} else if (event.key === 'ArrowLeft') {
			event.preventDefault();
			go(-1);
		} else if (event.key === 'Tab' && dialog) {
			// Fokusfalle: Tab bleibt im Dialog
			const focusable = [
				...dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]')
			];
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			if (!first || !last) return;
			const active = document.activeElement;
			if (event.shiftKey && (active === first || !dialog.contains(active))) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
				event.preventDefault();
				first.focus();
			}
		}
	}

	// Wischen (nur deutlich waagerechte Gesten, damit Scrollen/Zoomen nicht stört)
	let touchX = 0;
	let touchY = 0;
	let touchActive = false;

	function ontouchstart(event: TouchEvent) {
		if (event.touches.length !== 1) {
			touchActive = false;
			return;
		}
		const t = event.touches[0]!;
		touchX = t.clientX;
		touchY = t.clientY;
		touchActive = true;
	}

	function ontouchend(event: TouchEvent) {
		if (!touchActive) return;
		touchActive = false;
		const t = event.changedTouches[0];
		if (!t) return;
		const dx = t.clientX - touchX;
		const dy = t.clientY - touchY;
		if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
	}

	onMount(() => {
		const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		const overflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		closeButton?.focus();
		return () => {
			document.body.style.overflow = overflow;
			previous?.focus();
		};
	});

	// Nachbarbilder vorladen
	$effect(() => {
		if (count < 2) return;
		for (const delta of [1, -1]) {
			const neighbour = images[(index + delta + count) % count];
			if (neighbour) {
				const img = new Image();
				img.decoding = 'async';
				img.src = neighbour.src;
			}
		}
	});
</script>

<svelte:window {onkeydown} />

<div
	bind:this={dialog}
	class="fixed inset-0 z-[70] flex items-center justify-center bg-black text-white"
	role="dialog"
	tabindex="-1"
	aria-modal="true"
	aria-label="Bildansicht: {title}"
	aria-describedby={image?.description ? descriptionId : undefined}
	{ontouchstart}
	{ontouchend}
>
	{#if image}
		{#key image.id}
			<img
				src={image.src}
				alt={image.alt}
				width={image.width}
				height={image.height}
				class="h-auto max-h-[90vh] w-auto max-w-[90vw] rounded object-contain select-none"
				draggable="false"
			/>
		{/key}
	{/if}

	<p
		class="absolute top-5 left-5 text-sm font-medium text-white/70 tabular-nums"
		aria-live="polite"
	>
		{index + 1} / {count}
	</p>

	{#if count > 1}
		<button
			type="button"
			class="absolute top-1/2 left-2 size-12 -translate-y-1/2 text-4xl sm:left-4 sm:text-5xl md:text-6xl"
			onclick={() => go(-1)}
		>
			<span aria-hidden="true">‹</span>
			<span class="sr-only">Vorheriges Bild</span>
		</button>
		<button
			type="button"
			class="absolute top-1/2 right-2 size-12 -translate-y-1/2 text-4xl sm:right-4 sm:text-5xl md:text-6xl"
			onclick={() => go(1)}
		>
			<span aria-hidden="true">›</span>
			<span class="sr-only">Nächstes Bild</span>
		</button>
	{/if}

	{#if image?.description}
		<p
			id={descriptionId}
			class="absolute inset-x-0 bottom-0 bg-black/60 px-4 py-3 text-center text-sm leading-relaxed text-white/90"
		>
			{image.description}
		</p>
	{/if}

	<button
		bind:this={closeButton}
		type="button"
		class="absolute top-3 right-4 size-12 text-4xl font-bold sm:right-6 sm:text-5xl md:text-6xl"
		onclick={onclose}
	>
		<span aria-hidden="true">×</span>
		<span class="sr-only">Schließen</span>
	</button>
</div>
