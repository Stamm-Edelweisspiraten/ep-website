<script lang="ts">
    // Vollbild-Ansicht der Galerie: Pfeile/Tastatur/Wischen, Bildunterschrift, Zähler, nächstes Bild wird vorgeladen.
    import { createEventDispatcher, onDestroy, onMount, tick } from 'svelte';
    import Icon from './Icon.svelte';

    export let images: { src: string; alt: string; caption?: string | null }[];
    export let index: number;

    const dispatch = createEventDispatcher<{ close: void }>();

    let current = index;
    let touchStartX = 0;
    let closeButton: HTMLButtonElement;
    let previousFocus: HTMLElement | null = null;

    $: image = images[current];
    $: preload = images.length > 1 ? images[(current + 1) % images.length]?.src : null;

    function next() {
        current = (current + 1) % images.length;
    }

    function prev() {
        current = (current - 1 + images.length) % images.length;
    }

    function close() {
        dispatch('close');
    }

    function handleKey(event: KeyboardEvent) {
        if (event.key === 'Escape') close();
        if (event.key === 'ArrowRight') next();
        if (event.key === 'ArrowLeft') prev();
    }

    function handleTouchEnd(event: TouchEvent) {
        const diff = touchStartX - (event.changedTouches[0]?.screenX ?? touchStartX);
        if (Math.abs(diff) > 50) {
            if (diff > 0) next();
            else prev();
        }
    }

    onMount(async () => {
        previousFocus = document.activeElement as HTMLElement | null;
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        await tick();
        closeButton?.focus();
    });

    onDestroy(() => {
        if (typeof document === 'undefined') return;
        document.removeEventListener('keydown', handleKey);
        document.body.style.overflow = '';
        previousFocus?.focus();
    });
</script>

<div
    class="fixed inset-0 z-50 flex flex-col bg-black text-white"
    role="dialog"
    aria-modal="true"
    aria-label="Bildansicht"
    tabindex="-1"
    on:touchstart={(e) => (touchStartX = e.changedTouches[0]?.screenX ?? 0)}
    on:touchend={handleTouchEnd}
>
    <div class="flex items-center justify-between px-4 py-3 text-sm">
        <span class="tabular-nums text-white/80" aria-live="polite">{current + 1} / {images.length}</span>
        <button
            type="button"
            bind:this={closeButton}
            class="inline-flex size-10 items-center justify-center rounded-full hover:bg-white/10"
            aria-label="Schließen"
            on:click={close}><Icon name="x" size={26} /></button
        >
    </div>

    <div class="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16">
        {#if images.length > 1}
            <button
                type="button"
                class="absolute left-2 z-10 inline-flex size-12 items-center justify-center rounded-full bg-black/40 hover:bg-white/15"
                aria-label="Vorheriges Bild"
                on:click={prev}><Icon name="chevron-left" size={30} /></button
            >
        {/if}
        {#if image}
            {#key image.src}
                <img src={image.src} alt={image.alt} class="max-h-full max-w-full object-contain" />
            {/key}
        {/if}
        {#if images.length > 1}
            <button
                type="button"
                class="absolute right-2 z-10 inline-flex size-12 items-center justify-center rounded-full bg-black/40 hover:bg-white/15"
                aria-label="Nächstes Bild"
                on:click={next}><Icon name="chevron-right" size={30} /></button
            >
        {/if}
    </div>

    <div class="min-h-12 px-4 py-3 text-center text-sm text-white/85">
        {#if image?.caption}{image.caption}{/if}
    </div>

    {#if preload}
        <link rel="preload" as="image" href={preload} />
    {/if}
</div>
