<script lang="ts">
	interface Props {
		/** `light` = weiße Schrift (auf Bildern), `dark` = dunkle Schrift (auf hellem Grund) */
		tone?: 'light' | 'dark';
		class?: string;
	}

	let { tone = 'light', class: className = '' }: Props = $props();

	const text = $derived(tone === 'light' ? 'text-white' : 'text-brand-900');
	const bar = $derived(tone === 'light' ? 'bg-sun-400' : 'bg-brand-900');
</script>

<!-- Wie auf der alten Website; die Seite setzt eine (ggf. unsichtbare) h1 selbst -->
<div
	class="flex flex-col items-center justify-center gap-4 p-4 md:flex-row md:gap-8 md:p-6 {className}"
>
	<div class="text-center md:text-right {text}">
		<p class="text-2xl leading-tight font-semibold md:text-4xl">
			Stamm <br class="md:hidden" />
			<span class="font-bold">Edelweißpiraten</span>
		</p>
		<div class="mx-auto my-2 h-1 w-2/3 rounded md:mr-0 md:ml-auto {bar}"></div>
		<p class="text-base leading-tight font-bold md:text-lg">
			in der <br />
			Ev. Kirchengemeinde <br />
			Bremen-Hastedt
		</p>
	</div>
	<img
		src="/logo.avif"
		alt="Wappen Stamm Edelweißpiraten"
		width="144"
		height="144"
		class="h-auto w-24 shrink-0 md:w-36"
	/>
</div>
