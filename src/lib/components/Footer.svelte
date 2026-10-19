<script lang="ts">
	const year = new Date().getFullYear();

	const links = [
		{ href: '/impressum', label: 'Impressum' },
		{ href: '/datenschutz', label: 'Datenschutz' },
		{ href: '/kontakt', label: 'Kontakt' },
		{ href: '/team', label: 'Team' }
	];
</script>

<footer class="mt-12 border-t border-gray-300 bg-gray-100">
	<div class="mx-auto max-w-7xl space-y-2 px-6 py-6 text-center text-sm text-gray-600">
		<nav aria-label="Fußzeile">
			<ul class="flex flex-col justify-center gap-4 md:flex-row">
				{#each links as link (link.href)}
					<li><a href={link.href} class="hover:underline">{link.label}</a></li>
				{/each}
			</ul>
		</nav>
		<p>© {year} Stamm Edelweißpiraten – Alle Rechte vorbehalten.</p>
	</div>
</footer>
