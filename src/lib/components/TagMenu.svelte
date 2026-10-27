<script lang="ts">
	// Auswahl der Themen-Tags auf /termine: Pillen-Knopf mit Popover (Desktop) bzw. Blatt von unten (≤ 640 px).
	import { createEventDispatcher, onDestroy, tick } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';

	export let tags: string[] = [];
	export let selected: string[] = [];

	const dispatch = createEventDispatcher<{ change: string[] }>();
	const SEARCH_FROM = 8;
	const uid = `tagmenu-${Math.random().toString(36).slice(2, 8)}`;

	let open = false;
	let alignRight = false;
	let search = '';
	let root: HTMLDivElement;
	let button: HTMLButtonElement;
	let panel: HTMLDivElement;
	let lockedScroll = false;

	const lower = (v: string) => v.trim().toLocaleLowerCase('de-DE');
	$: needle = lower(search);
	$: visible = needle ? tags.filter((t) => lower(t).includes(needle)) : tags;
	$: label = selected.length ? `Tags (${selected.length})` : 'Tags';

	function isSheet() {
		return typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches;
	}

	function lockScroll(on: boolean) {
		if (typeof document === 'undefined') return;
		if (on && !lockedScroll) {
			document.documentElement.style.overflow = 'hidden';
			lockedScroll = true;
		} else if (!on && lockedScroll) {
			document.documentElement.style.overflow = '';
			lockedScroll = false;
		}
	}

	async function show() {
		const r = button.getBoundingClientRect();
		alignRight = r.left + 340 > window.innerWidth - 16;
		search = '';
		open = true;
		if (isSheet()) lockScroll(true);
		await tick();
		// Blatt: Fokus aufs Blatt (keine Bildschirmtastatur), Popover: erstes Feld
		if (isSheet()) panel?.focus({ preventScroll: true });
		else panel?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true });
	}

	function close(returnFocus = false) {
		if (!open) return;
		open = false;
		lockScroll(false);
		if (returnFocus) button?.focus();
	}

	function toggleOpen() {
		if (open) close();
		else show();
	}

	function toggleTag(t: string) {
		dispatch('change', selected.includes(t) ? selected.filter((x) => x !== t) : [...selected, t]);
	}

	function remove(t: string) {
		dispatch(
			'change',
			selected.filter((x) => x !== t)
		);
		button?.focus();
	}

	function reset() {
		dispatch('change', []);
	}

	function onWindowPointer(e: PointerEvent) {
		if (open && root && !root.contains(e.target as Node)) close();
	}

	function onKey(e: KeyboardEvent) {
		if (open && e.key === 'Escape') {
			e.preventDefault();
			close(true);
		}
	}

	function onFocusOut(e: FocusEvent) {
		const next = e.relatedTarget as Node | null;
		if (open && next && !root.contains(next)) close();
	}

	onDestroy(() => lockScroll(false));
</script>

<svelte:window on:pointerdown={onWindowPointer} on:keydown={onKey} />

{#if tags.length}
	<div class="tm" bind:this={root} on:focusout={onFocusOut}>
		<div class="anchor">
			<button
				type="button"
				class="chip trigger"
				class:has={selected.length > 0}
				bind:this={button}
				aria-haspopup="dialog"
				aria-expanded={open}
				aria-controls={uid}
				on:click={toggleOpen}
			>
				{label}<Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} />
			</button>

			{#if open}
				<button
					type="button"
					class="backdrop"
					tabindex="-1"
					aria-label="Tags schließen"
					on:click={() => close(true)}
				></button>
				<div
					class="panel"
					class:right={alignRight}
					id={uid}
					role="dialog"
					aria-label="Tags wählen"
					tabindex="-1"
					bind:this={panel}
				>
					<div class="grip" aria-hidden="true"></div>
					<div class="head">
						<p class="ht">Nach Tags filtern</p>
						{#if selected.length}<span class="cap">{selected.length} gewählt</span>{/if}
					</div>
					{#if tags.length >= SEARCH_FROM}
						<label class="find">
							<span class="sr-only">Tags durchsuchen</span>
							<Icon name="search" size={18} />
							<input
								type="search"
								class="field"
								bind:value={search}
								placeholder="Tag suchen …"
								autocomplete="off"
							/>
						</label>
					{/if}
					<ul class="opts">
						{#each visible as t (t)}
							<li>
								<label class="opt">
									<input
										type="checkbox"
										checked={selected.includes(t)}
										on:change={() => toggleTag(t)}
									/>
									<span>{t}</span>
								</label>
							</li>
						{:else}
							<li class="none cap">Kein Tag gefunden.</li>
						{/each}
					</ul>
					<div class="foot">
						<button
							type="button"
							class="pill sm canvas"
							disabled={!selected.length}
							on:click={reset}>Zurücksetzen</button
						>
						<button type="button" class="pill sm done" on:click={() => close(true)}>Fertig</button>
					</div>
				</div>
			{/if}
		</div>

		{#each selected as t (t)}
			<button
				type="button"
				class="chip on sel"
				on:click={() => remove(t)}
				aria-label={`Tag „${t}“ entfernen`}
			>
				{t}<Icon name="x" size={16} />
			</button>
		{/each}
	</div>
{/if}

<style>
	.tm {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
	}
	.anchor {
		position: relative;
	}
	.trigger.has {
		background: var(--color-subtle-2);
	}
	.sel :global(.i) {
		opacity: 0.8;
	}
	.backdrop {
		display: none;
	}
	.panel {
		position: absolute;
		left: 0;
		top: calc(100% + 8px);
		z-index: 40;
		width: 320px;
		max-width: calc(100vw - 32px);
		background: var(--color-subtle);
		padding: 8px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.panel.right {
		left: auto;
		right: 0;
	}
	.grip {
		display: none;
	}
	.panel:focus {
		outline: none;
	}
	.head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 12px;
		padding: 8px 12px 2px;
	}
	.ht {
		font-weight: 500;
	}
	.find {
		position: relative;
		display: block;
	}
	.find :global(svg) {
		position: absolute;
		left: 16px;
		top: 50%;
		transform: translateY(-50%);
		color: var(--color-muted);
	}
	.find .field {
		background: var(--color-page);
		min-height: 44px;
		padding: 8px 16px 8px 44px;
	}
	.opts {
		max-height: 320px;
		overflow-y: auto;
		overscroll-behavior: contain;
		display: flex;
		flex-direction: column;
	}
	.opt {
		display: flex;
		align-items: center;
		gap: 12px;
		min-height: 44px;
		padding: 0 12px;
		cursor: pointer;
		color: var(--color-ink);
		transition: background 0.15s ease;
	}
	.opt:hover {
		background: var(--color-page);
	}
	.opt input {
		width: 20px;
		height: 20px;
		flex: none;
		margin: 0;
		accent-color: var(--color-ink);
		cursor: pointer;
	}
	.opt span {
		min-width: 0;
		overflow-wrap: anywhere;
	}
	.none {
		padding: 10px 12px;
	}
	.foot {
		display: flex;
		justify-content: space-between;
		gap: 8px;
		padding: 6px 4px 4px;
	}
	.done {
		display: none;
	}
	@media (max-width: 640px) {
		.backdrop {
			display: block;
			position: fixed;
			inset: 0;
			z-index: 200;
			border: 0;
			padding: 0;
			background: rgba(0, 0, 0, 0.45);
			cursor: default;
		}
		.panel,
		.panel.right {
			position: fixed;
			left: 0;
			right: 0;
			top: auto;
			bottom: 0;
			z-index: 201;
			width: auto;
			max-width: none;
			max-height: 85dvh;
			padding: 8px 16px calc(16px + env(safe-area-inset-bottom));
			background: var(--color-page);
		}
		.grip {
			display: block;
			width: 40px;
			height: 4px;
			border-radius: 2px;
			background: var(--color-subtle-2);
			margin: 4px auto 4px;
		}
		.head {
			padding: 8px 4px 4px;
		}
		.ht {
			font-size: 18px;
		}
		.find .field {
			background: var(--color-subtle);
		}
		.opts {
			max-height: none;
			flex: 1 1 auto;
			min-height: 0;
		}
		.opt {
			min-height: 52px;
			padding: 0 8px;
		}
		.opt:hover {
			background: var(--color-subtle);
		}
		.foot {
			padding: 12px 0 0;
		}
		.foot .pill {
			flex: 1 1 0;
			height: 48px;
		}
		.foot .canvas {
			background: var(--color-subtle);
		}
		.done {
			display: inline-flex;
		}
	}
</style>
