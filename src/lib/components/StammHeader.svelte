<script lang="ts">
	interface Props {
		/** `light` = weiße Schrift (auf Bildern), `dark` = dunkle Schrift (auf hellem Grund) */
		tone?: 'light' | 'dark';
		class?: string;
	}

	let { tone = 'light', class: className = '' }: Props = $props();

	const text = $derived(tone === 'light' ? 'text-white drop-shadow-md' : 'text-brand-900');
	const bar = $derived(tone === 'light' ? 'bg-white' : 'bg-brand-700');
</script>

<div
	class="flex flex-col items-center justify-center gap-4 p-4 md:flex-row md:gap-8 md:p-6 {className}"
>
	<div class="text-center md:text-right {text}">
		<p class="text-3xl leading-tight font-semibold md:text-5xl">
			Stamm <br class="md:hidden" />
			<span class="font-extrabold">Edelweißpiraten</span>
		</p>
		<div class="mx-auto my-3 h-1 w-2/3 rounded-full md:mr-0 md:ml-auto {bar}"></div>
		<p class="text-base leading-snug font-bold md:text-lg">
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
		class="h-auto w-24 shrink-0 md:w-36 {tone === 'light' ? 'drop-shadow-lg' : ''}"
	/>
</div>
