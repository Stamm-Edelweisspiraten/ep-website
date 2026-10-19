<script lang="ts">
	const year = new Date().getFullYear();

	const links = [
		{ href: '/kontakt', label: 'Kontakt' },
		{ href: '/impressum', label: 'Impressum' },
		{ href: '/datenschutz', label: 'Datenschutz' }
	];
</script>

<footer class="mt-auto border-t border-line bg-surface">
	<div class="container-page grid gap-8 py-10 sm:grid-cols-[1fr_auto] sm:items-start">
		<div class="flex items-start gap-3">
			<img src="/logo.avif" alt="" width="40" height="40" class="h-10 w-auto" />
			<div>
				<p class="font-bold text-ink">Stamm Edelweißpiraten</p>
				<p class="text-sm text-muted">
					Christliche Pfadfinderschaft Deutschlands (CPD)<br />
					Ev. Kirchengemeinde Bremen-Hastedt · Drakenburger Str. 42 · 28207 Bremen
				</p>
			</div>
		</div>

		<nav aria-label="Fußzeile">
			<ul class="flex flex-wrap gap-x-5 gap-y-2 text-sm">
				{#each links as link (link.href)}
					<li>
						<a href={link.href} class="text-muted hover:text-brand-800 hover:underline">
							{link.label}
						</a>
					</li>
				{/each}
				<li>
					<a
						href="https://instagram.com/edelweisspiraten_cpd"
						class="text-muted hover:text-brand-800 hover:underline"
						target="_blank"
						rel="noopener noreferrer"
					>
						Instagram
					</a>
				</li>
			</ul>
		</nav>
	</div>
	<div class="border-t border-line">
		<p class="container-page py-4 text-xs text-muted">
			© {year} Stamm Edelweißpiraten – Alle Rechte vorbehalten.
		</p>
	</div>
</footer>
