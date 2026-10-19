<script lang="ts">
	interface Props {
		/** Instagram-Name ohne @ */
		handle?: string;
		class?: string;
	}

	let { handle = 'edelweisspiraten_cpd', class: className = '' }: Props = $props();
</script>

<section class="container-page py-12 {className}" aria-labelledby="instagram-titel">
	<div class="w-full bg-linear-to-br from-pink-500 to-purple-600 p-8 text-white shadow-md">
		<h2 id="instagram-titel" class="mb-4 text-2xl font-bold text-white">
			<span aria-hidden="true">📸</span> Folge uns auf Instagram!
		</h2>
		<p class="mb-6">Erlebe unsere Aktionen, Fahrten und Gruppenstunden mit – auch online.</p>
		<a
			href="https://instagram.com/{handle}"
			target="_blank"
			rel="noopener noreferrer"
			class="inline-block rounded-full bg-white px-6 py-2 font-bold text-pink-600 transition-colors hover:bg-gray-100 focus-visible:outline-white"
		>
			@{handle}
		</a>
	</div>
</section>
