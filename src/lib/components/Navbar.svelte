<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import type { GroupType, WebsiteGroup } from '$lib/server/types';

	interface Props {
		/** Gruppen für das Dropdown (aus dem Layout-Load); leer → nur Link „Gruppen“ */
		groups?: WebsiteGroup[];
	}

	let { groups = [] }: Props = $props();

	/** Reihenfolge wie auf der alten Website (Gruppen-Dropdown steht davor) */
	const links = [
		{ href: '/galerie', label: 'Galerie' },
		{ href: '/termine', label: 'Termine' },
		{ href: '/team', label: 'Team' },
		{ href: '/cpd', label: 'CPD' },
		{ href: '/kontakt', label: 'Kontakt' }
	];

	const TYPE_LABELS: Record<GroupType, string> = { meute: 'Meute', sippe: 'Sippe' };

	const sections = $derived(
		(['meute', 'sippe'] as const)
			.map((type) => ({
				type,
				label: TYPE_LABELS[type],
				items: groups.filter((g) => g.type === type)
			}))
			.filter((s) => s.items.length > 0)
	);

	/** Als string – die Route-Typen kennen nicht jede Seite (z. B. `/team`) */
	const currentPath: string = $derived(page.url.pathname);

	let mobileOpen = $state(false);
	let groupsOpen = $state(false);
	let groupsButton: HTMLButtonElement | undefined = $state();
	let groupsWrapper: HTMLDivElement | undefined = $state();

	afterNavigate(() => {
		mobileOpen = false;
		groupsOpen = false;
	});

	function isActive(href: string) {
		const path = currentPath;
		return href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`);
	}

	function onWindowClick(event: MouseEvent) {
		if (groupsOpen && groupsWrapper && !groupsWrapper.contains(event.target as Node)) {
			groupsOpen = false;
		}
	}

	function onWindowKeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape') return;
		if (groupsOpen) {
			groupsOpen = false;
			groupsButton?.focus();
		} else if (mobileOpen) {
			mobileOpen = false;
		}
	}

	function onDropdownFocusout(event: FocusEvent) {
		const next = event.relatedTarget as Node | null;
		if (next && groupsWrapper && !groupsWrapper.contains(next)) groupsOpen = false;
	}

	const navLink =
		'nav-link rounded-full px-3.5 py-2 text-[0.95rem] font-semibold text-ink/80 transition-colors hover:bg-brand-50 hover:text-brand-800';
	const dropdownLink =
		'block rounded-lg px-3 py-2.5 text-base font-medium text-ink transition-colors hover:bg-brand-50 hover:text-brand-800';
	const mobileLink =
		'block rounded-lg px-3 text-lg font-semibold text-ink transition-colors hover:bg-brand-50 hover:text-brand-800';
</script>

<svelte:window onclick={onWindowClick} onkeydown={onWindowKeydown} />

<header
	class="sticky top-0 z-50 border-b border-line/80 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/80"
>
	<nav
		class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
		aria-label="Hauptnavigation"
	>
		<a href="/" class="flex items-center gap-2.5" aria-label="Edelweißpiraten – Startseite">
			<img src="/logo.avif" alt="" width="36" height="36" class="size-9" />
			<span class="leading-none">
				<span class="block text-[0.7rem] font-semibold tracking-[0.16em] text-muted uppercase"
					>Stamm</span
				>
				<span class="block text-lg font-extrabold tracking-tight text-brand-800"
					>Edelweißpiraten</span
				>
			</span>
		</a>

		<!-- Desktop -->
		<ul class="hidden items-center gap-1 md:flex">
			<li>
				{#if sections.length > 0}
					<div class="relative" bind:this={groupsWrapper} onfocusout={onDropdownFocusout}>
						<button
							bind:this={groupsButton}
							type="button"
							class="{navLink} flex items-center gap-1.5"
							data-active={isActive('/gruppen') ? '' : undefined}
							aria-expanded={groupsOpen}
							aria-controls="nav-gruppen"
							onclick={() => (groupsOpen = !groupsOpen)}
						>
							Gruppen
							<svg
								class="size-4 transition-transform motion-reduce:transition-none {groupsOpen
									? 'rotate-180'
									: ''}"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								aria-hidden="true"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
							</svg>
						</button>
						{#if groupsOpen}
							<div
								id="nav-gruppen"
								class="absolute top-full left-0 z-50 mt-2 w-64 rounded-2xl border border-line bg-white p-2 shadow-card-hover"
							>
								{#each sections as section, i (section.type)}
									{#if i > 0}<hr class="my-2 border-line" />{/if}
									<p class="eyebrow px-3 pt-2 pb-1 text-muted">{section.label}</p>
									<ul>
										{#each section.items as group (group.id)}
											<li>
												<a
													href="/gruppen/{group.slug}"
													class={dropdownLink}
													aria-current={isActive(`/gruppen/${group.slug}`) ? 'page' : undefined}
												>
													{group.name}
												</a>
											</li>
										{/each}
									</ul>
								{/each}
								<hr class="my-2 border-line" />
								<a
									href="/gruppen"
									class="{dropdownLink} text-muted"
									aria-current={currentPath === '/gruppen' ? 'page' : undefined}
								>
									Alle Gruppen
								</a>
							</div>
						{/if}
					</div>
				{:else}
					<a
						href="/gruppen"
						class={navLink}
						aria-current={isActive('/gruppen') ? 'page' : undefined}
					>
						Gruppen
					</a>
				{/if}
			</li>
			{#each links as link (link.href)}
				<li>
					<a
						href={link.href}
						class={navLink}
						aria-current={isActive(link.href) ? 'page' : undefined}
					>
						{link.label}
					</a>
				</li>
			{/each}
		</ul>

		<!-- Mobil -->
		<button
			type="button"
			class="-mr-2 inline-flex size-11 items-center justify-center rounded-full text-ink hover:bg-brand-50 md:hidden"
			aria-expanded={mobileOpen}
			aria-controls="nav-mobil"
			aria-label={mobileOpen ? 'Menü schließen' : 'Menü öffnen'}
			onclick={() => (mobileOpen = !mobileOpen)}
		>
			<svg
				class="size-6"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				aria-hidden="true"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
				/>
			</svg>
		</button>
	</nav>

	{#if mobileOpen}
		<div id="nav-mobil" class="border-t border-line bg-white px-4 pb-6 md:hidden">
			<p class="eyebrow mt-5 px-3">Gruppen</p>
			<div>
				{#each sections as section (section.type)}
					<p class="mt-3 px-3 text-xs font-semibold text-muted uppercase">{section.label}</p>
					<ul>
						{#each section.items as group (group.id)}
							<li>
								<a
									href="/gruppen/{group.slug}"
									class="{mobileLink} py-2"
									aria-current={isActive(`/gruppen/${group.slug}`) ? 'page' : undefined}
								>
									{group.name}
								</a>
							</li>
						{/each}
					</ul>
				{/each}
				<a
					href="/gruppen"
					class="{mobileLink} {sections.length > 0 ? 'mt-2' : 'mt-1'} py-2"
					aria-current={currentPath === '/gruppen' ? 'page' : undefined}
				>
					Alle Gruppen
				</a>
			</div>

			<hr class="my-4 border-line" />

			<ul class="space-y-1">
				{#each links as link (link.href)}
					<li>
						<a
							href={link.href}
							class="{mobileLink} py-2"
							aria-current={isActive(link.href) ? 'page' : undefined}
						>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</header>

<style>
	a[aria-current='page'],
	[data-active] {
		background-color: var(--color-brand-50);
		color: var(--color-brand-800);
	}
</style>
