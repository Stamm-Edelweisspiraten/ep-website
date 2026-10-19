<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { safeColor } from '$lib/format';
	import type { GroupType, WebsiteGroup } from '$lib/server/types';

	interface Props {
		/** Gruppen für das Dropdown (aus dem Layout-Load); leer → nur Link „Gruppen“ */
		groups?: WebsiteGroup[];
	}

	let { groups = [] }: Props = $props();

	const links = [
		{ href: '/termine', label: 'Termine' },
		{ href: '/galerie', label: 'Galerie' },
		{ href: '/kontakt', label: 'Kontakt' },
		{ href: '/cpd', label: 'CPD' }
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

	/** Als string – die Route-Typen kennen `/gruppen` noch nicht */
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

	const linkBase =
		'rounded-full px-3 py-2 text-[0.95rem] font-medium text-ink/80 transition-colors hover:bg-brand-50 hover:text-brand-800';
	const linkActive = 'bg-brand-50 text-brand-800';
</script>

<svelte:window onclick={onWindowClick} onkeydown={onWindowKeydown} />

<header class="sticky top-0 z-50 border-b border-line bg-surface/90 backdrop-blur">
	<nav
		class="container-page flex h-16 items-center justify-between gap-4"
		aria-label="Hauptnavigation"
	>
		<a
			href="/"
			class="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-brand-900"
		>
			<img src="/logo.avif" alt="" width="32" height="32" class="h-8 w-auto" />
			<span>Edelweißpiraten</span>
		</a>

		<!-- Desktop -->
		<ul class="hidden items-center gap-1 md:flex">
			<li>
				<a
					href="/"
					class="{linkBase} {isActive('/') ? linkActive : ''}"
					aria-current={isActive('/') ? 'page' : undefined}
				>
					Start
				</a>
			</li>
			<li>
				{#if sections.length > 0}
					<div class="relative" bind:this={groupsWrapper} onfocusout={onDropdownFocusout}>
						<button
							bind:this={groupsButton}
							type="button"
							class="{linkBase} inline-flex items-center gap-1 {isActive('/gruppen')
								? linkActive
								: ''}"
							aria-expanded={groupsOpen}
							aria-controls="nav-gruppen"
							onclick={() => (groupsOpen = !groupsOpen)}
						>
							Gruppen
							<svg
								class="size-4 transition-transform {groupsOpen ? 'rotate-180' : ''}"
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
								class="absolute top-full left-0 mt-2 w-72 rounded-card border border-line bg-surface p-2 shadow-card-hover"
							>
								{#each sections as section (section.type)}
									<p class="eyebrow px-3 pt-2 pb-1 text-muted">{section.label}</p>
									<ul>
										{#each section.items as group (group.id)}
											<li>
												<a
													href="/gruppen/{group.slug}"
													class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-50 hover:text-brand-800"
													aria-current={isActive(`/gruppen/${group.slug}`) ? 'page' : undefined}
												>
													<span
														class="size-2.5 shrink-0 rounded-full bg-brand-500"
														style:background-color={safeColor(group.color)}
														aria-hidden="true"
													></span>
													{group.name}
												</a>
											</li>
										{/each}
									</ul>
								{/each}
								<div class="mt-1 border-t border-line pt-1">
									<a
										href="/gruppen"
										class="block rounded-lg px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
									>
										Alle Gruppen
									</a>
								</div>
							</div>
						{/if}
					</div>
				{:else}
					<a
						href="/gruppen"
						class="{linkBase} {isActive('/gruppen') ? linkActive : ''}"
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
						class="{linkBase} {isActive(link.href) ? linkActive : ''}"
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
			class="inline-flex size-11 items-center justify-center rounded-full text-ink hover:bg-brand-50 md:hidden"
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
		<div id="nav-mobil" class="border-t border-line bg-surface md:hidden">
			<ul class="container-page space-y-1 py-4">
				<li>
					<a
						href="/"
						class="block rounded-lg px-3 py-3 text-lg font-semibold hover:bg-brand-50"
						aria-current={isActive('/') ? 'page' : undefined}
					>
						Start
					</a>
				</li>
				<li>
					<a
						href="/gruppen"
						class="block rounded-lg px-3 py-3 text-lg font-semibold hover:bg-brand-50"
						aria-current={currentPath === '/gruppen' ? 'page' : undefined}
					>
						Gruppen
					</a>
					{#each sections as section (section.type)}
						<p class="eyebrow mt-2 px-6 text-muted">{section.label}</p>
						<ul>
							{#each section.items as group (group.id)}
								<li>
									<a
										href="/gruppen/{group.slug}"
										class="flex items-center gap-2 rounded-lg py-2.5 pr-3 pl-6 text-base font-medium hover:bg-brand-50"
										aria-current={isActive(`/gruppen/${group.slug}`) ? 'page' : undefined}
									>
										<span
											class="size-2.5 shrink-0 rounded-full bg-brand-500"
											style:background-color={safeColor(group.color)}
											aria-hidden="true"
										></span>
										{group.name}
									</a>
								</li>
							{/each}
						</ul>
					{/each}
				</li>
				{#each links as link (link.href)}
					<li>
						<a
							href={link.href}
							class="block rounded-lg px-3 py-3 text-lg font-semibold hover:bg-brand-50"
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
		color: var(--color-brand-800);
	}
</style>
