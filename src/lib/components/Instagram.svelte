<script lang="ts">
	interface Props {
		/** Instagram-Name ohne @ */
		handle?: string;
		class?: string;
	}

	let { handle = 'edelweisspiraten_cpd', class: className = '' }: Props = $props();
</script>

<section class="container-page py-12 {className}" aria-labelledby="instagram-titel">
	<div
		class="flex flex-col gap-6 overflow-hidden rounded-card bg-linear-to-br from-brand-700 to-brand-900 p-8 text-white shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-10"
	>
		<div class="flex items-start gap-4">
			<svg
				class="mt-1 size-8 shrink-0"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.8"
				aria-hidden="true"
			>
				<rect x="3" y="3" width="18" height="18" rx="5" />
				<circle cx="12" cy="12" r="4" />
				<circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
			</svg>
			<div>
				<h2 id="instagram-titel" class="text-2xl text-white">Folge uns auf Instagram!</h2>
				<p class="mt-1 text-white/85">
					Erlebe unsere Aktionen, Fahrten und Gruppenstunden mit – auch online.
				</p>
			</div>
		</div>
		<a
			href="https://instagram.com/{handle}"
			target="_blank"
			rel="noopener noreferrer"
			class="btn shrink-0 bg-white text-brand-800 hover:bg-brand-50 focus-visible:outline-white"
		>
			@{handle}
		</a>
	</div>
</section>
