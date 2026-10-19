<script lang="ts">
	interface Props {
		/** Instagram-Name ohne @ */
		handle?: string;
		class?: string;
	}

	let { handle = 'edelweisspiraten_cpd', class: className = '' }: Props = $props();
</script>

<!-- Instagram-Hinweis (Startseite); der Link steht zusätzlich in der Fußzeile -->
<section class={className} aria-labelledby="instagram-titel">
	<div
		class="relative overflow-hidden rounded-card bg-brand-800 p-8 text-white shadow-card sm:p-10"
	>
		<div
			class="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-linear-to-br from-pink-500/50 to-amber-400/40 blur-2xl"
			aria-hidden="true"
		></div>
		<div class="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h2 id="instagram-titel" class="text-2xl font-bold text-white">Folge uns auf Instagram</h2>
				<p class="mt-2 max-w-lg text-brand-100">
					Erlebe unsere Aktionen, Fahrten und Gruppenstunden mit – auch online.
				</p>
			</div>
			<a
				href="https://instagram.com/{handle}"
				target="_blank"
				rel="noopener noreferrer"
				class="btn shrink-0 bg-white text-brand-800 hover:bg-brand-50 focus-visible:outline-white"
			>
				<svg
					class="size-5"
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
				@{handle}<span class="sr-only"> (neues Fenster)</span>
			</a>
		</div>
	</div>
</section>
