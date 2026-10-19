<script lang="ts">
	import { onMount } from 'svelte';
	import { isLongText } from './contact';

	interface Props {
		text: string;
		class?: string;
	}

	let { text, class: className = '' }: Props = $props();

	// Ohne JavaScript bleibt der ganze Text sichtbar; eingeklappt wird erst im Browser.
	let mounted = $state(false);
	let expanded = $state(false);
	const long = $derived(isLongText(text));
	const clamped = $derived(mounted && long && !expanded);
	const id = $props.id();

	onMount(() => {
		mounted = true;
	});
</script>

<div class={className}>
	<p id="text-{id}" class="whitespace-pre-line {clamped ? 'line-clamp-4' : ''}">{text}</p>
	{#if mounted && long}
		<button
			type="button"
			class="mt-1 text-sm font-semibold text-brand-700 hover:text-brand-800 hover:underline"
			aria-expanded={expanded}
			aria-controls="text-{id}"
			onclick={() => (expanded = !expanded)}
		>
			{expanded ? 'Weniger anzeigen' : 'Weiterlesen'}
		</button>
	{/if}
</div>
