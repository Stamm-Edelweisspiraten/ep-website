<script>
    import '../app.css';
    import Navbar from '$lib/components/Navbar.svelte';
    import Footer from '$lib/components/Footer.svelte';
    import SiteBanner from '$lib/components/SiteBanner.svelte';
    import Analytics from '$lib/components/Analytics.svelte';

    export let data;

    $: barBanners = data.banners.filter((b) => b.placement === 'bar');
</script>

<svelte:head>
    <link rel="alternate" type="application/rss+xml" title="Blog – Stamm Edelweißpiraten" href="/blog/rss.xml" />
    {#if data.umamiWebsiteId}
        <!-- Besucherstatistik (Umami, selbst gehostet, ohne Cookies) über die eigene Domain, siehe lib/server/umami.ts -->
        <script defer src="/stats/script.js" data-website-id={data.umamiWebsiteId} data-do-not-track="true" data-exclude-search="true" data-exclude-hash="true"></script>
    {/if}
</svelte:head>

<div class="flex min-h-screen flex-col bg-page text-ink">
    <a href="#inhalt" class="skip-link">Zum Inhalt springen</a>
    <SiteBanner banners={barBanners} />
    <Navbar groups={data.groups} />
    <main id="inhalt" tabindex="-1" class="flex-grow focus:outline-none">
        <slot />
    </main>
    <Footer groups={data.groups} />
</div>
{#if data.umamiWebsiteId}<Analytics />{/if}
