<script lang="ts">
	const year = new Date().getFullYear();

	const pages = [
		{ href: '/gruppen', label: 'Gruppen' },
		{ href: '/termine', label: 'Termine' },
		{ href: '/galerie', label: 'Galerie' },
		{ href: '/team', label: 'Team' },
		{ href: '/cpd', label: 'CPD' },
		{ href: '/kontakt', label: 'Kontakt' }
	];

	const legal = [
		{ href: '/impressum', label: 'Impressum' },
		{ href: '/datenschutz', label: 'Datenschutz' }
	];

	const INSTAGRAM = 'edelweisspiraten_cpd';
</script>

<footer class="mt-16 bg-brand-950 text-brand-100">
	<div class="h-1 bg-linear-to-r from-brand-600 via-sun-400 to-ember-600" aria-hidden="true"></div>
	<div class="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
		<div class="space-y-4">
			<a href="/" class="inline-flex items-center gap-3">
				<img src="/logo.avif" alt="" width="48" height="48" class="size-12" />
				<span class="leading-tight">
					<span class="block text-xs font-semibold tracking-[0.16em] text-brand-300 uppercase"
						>Stamm</span
					>
					<span class="block text-xl font-extrabold text-white">Edelweißpiraten</span>
				</span>
			</a>
			<p class="max-w-sm text-sm leading-relaxed text-brand-200">
				Pfadfinden in der Christlichen Pfadfinderschaft Deutschlands e.V. – in der Ev.
				Kirchengemeinde Bremen-Hastedt.
			</p>
			<address class="text-sm leading-relaxed text-brand-200 not-italic">
				Drakenburger Str. 42<br />28207 Bremen
			</address>
		</div>

		<nav aria-label="Seiten">
			<p class="mb-3 text-xs font-bold tracking-[0.14em] text-brand-300 uppercase">Entdecken</p>
			<ul class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-1">
				{#each pages as link (link.href)}
					<li>
						<a href={link.href} class="text-brand-100 transition-colors hover:text-white">
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<div class="space-y-6">
			<div>
				<p class="mb-3 text-xs font-bold tracking-[0.14em] text-brand-300 uppercase">Folge uns</p>
				<a
					href="https://instagram.com/{INSTAGRAM}"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
				>
					<svg
						class="size-4"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						aria-hidden="true"
					>
						<rect x="3" y="3" width="18" height="18" rx="5" />
						<circle cx="12" cy="12" r="4" />
						<circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
					</svg>
					@{INSTAGRAM}<span class="sr-only"> auf Instagram (neues Fenster)</span>
				</a>
			</div>
			<nav aria-label="Rechtliches">
				<p class="mb-3 text-xs font-bold tracking-[0.14em] text-brand-300 uppercase">Rechtliches</p>
				<ul class="flex gap-4 text-sm">
					{#each legal as link (link.href)}
						<li>
							<a href={link.href} class="text-brand-100 transition-colors hover:text-white">
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</nav>
		</div>
	</div>
	<div class="border-t border-white/10">
		<p class="container-page py-5 text-xs text-brand-300">
			© {year} Stamm Edelweißpiraten – Alle Rechte vorbehalten.
		</p>
	</div>
</footer>
