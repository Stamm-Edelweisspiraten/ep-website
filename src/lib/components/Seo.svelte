<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { page } from '$app/state';

	interface Props {
		/** Seitentitel ohne Zusatz; wird zu „<title> – Stamm Edelweißpiraten“ */
		title?: string | null;
		description?: string;
		/** Vorschaubild (absolut oder relativ zur Website) */
		image?: string | null;
	}

	let {
		title = null,
		description = 'Pfadfinder in Bremen-Hastedt – Abenteuer, Gemeinschaft & wöchentliche Gruppenstunden für Kinder und Jugendliche.',
		image = '/pfadfinder.avif'
	}: Props = $props();

	const SITE = 'Stamm Edelweißpiraten';
	const fullTitle = $derived(title ? `${title} – ${SITE}` : SITE);
	const base = $derived((env.PUBLIC_SITE_URL ?? '').replace(/\/+$/, ''));
	const canonical = $derived(base ? `${base}${page.url.pathname}` : null);
	const imageUrl = $derived(image && base && image.startsWith('/') ? `${base}${image}` : image);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<meta property="og:site_name" content={SITE} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:locale" content="de_DE" />
	{#if canonical}
		<link rel="canonical" href={canonical} />
		<meta property="og:url" content={canonical} />
	{/if}
	{#if imageUrl}<meta property="og:image" content={imageUrl} />{/if}
</svelte:head>
