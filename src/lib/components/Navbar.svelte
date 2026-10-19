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

	const navLink = 'text-lg font-medium text-gray-700 transition-colors hover:text-blue-600';
	const dropdownLink =
		'block px-5 py-3 text-base font-medium text-gray-800 transition-colors hover:bg-gray-100';
	const mobileLink =
		'block text-lg font-semibold text-gray-700 transition-colors hover:text-blue-600';
</script>

<svelte:window onclick={onWindowClick} onkeydown={onWindowKeydown} />

<header class="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-md">
	<nav
		class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
		aria-label="Hauptnavigation"
	>
		<a href="/" class="text-xl font-extrabold text-indigo-900">Edelweißpiraten</a>

		<!-- Desktop -->
		<ul class="hidden items-center gap-6 md:flex">
			<li>
				{#if sections.length > 0}
					<div class="relative" bind:this={groupsWrapper} onfocusout={onDropdownFocusout}>
						<button
							bind:this={groupsButton}
							type="button"
							class="{navLink} flex items-center gap-2 {isActive('/gruppen')
								? 'text-blue-600'
								: ''}"
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
								class="absolute top-full left-0 z-50 mt-3 w-64 border border-gray-200 bg-white px-4 py-3 shadow-md"
							>
								{#each sections as section, i (section.type)}
									{#if i > 0}<hr class="my-2 border-gray-200" />{/if}
									<p class="mb-1 text-xs font-semibold text-gray-400 uppercase">{section.label}</p>
									<ul>
										{#each section.items as group (group.id)}
											<li>
												<a
													href="/gruppen/{group.slug}"
													class="{dropdownLink} pl-4"
													aria-current={isActive(`/gruppen/${group.slug}`) ? 'page' : undefined}
												>
													{group.name}
												</a>
											</li>
										{/each}
									</ul>
								{/each}
								<hr class="my-2 border-gray-200" />
								<a
									href="/gruppen"
									class="{dropdownLink} text-gray-600"
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
			class="-mr-2 inline-flex size-11 items-center justify-center text-gray-700 md:hidden"
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
		<div id="nav-mobil" class="border-t border-gray-200 bg-white px-4 pb-4 md:hidden">
			<p class="mt-4 text-sm font-semibold tracking-wide text-gray-500 uppercase">Gruppen</p>
			<div class="ml-2">
				{#each sections as section (section.type)}
					<p class="mt-3 text-xs font-semibold text-gray-400 uppercase">{section.label}</p>
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

			<hr class="my-4 border-gray-300" />

			<ul class="space-y-3">
				{#each links as link (link.href)}
					<li>
						<a
							href={link.href}
							class={mobileLink}
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
	a[aria-current='page'] {
		color: var(--color-blue-600);
	}
</style>
