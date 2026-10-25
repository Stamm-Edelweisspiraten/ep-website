<script>
    import '../app.css';
    import Navbar from '$lib/components/Navbar.svelte';
    import Footer from '$lib/components/Footer.svelte';
    import SiteBanner from '$lib/components/SiteBanner.svelte';

    export let data;

    $: barBanners = data.banners.filter((b) => b.placement === 'bar');
</script>

<svelte:head>
    <link rel="alternate" type="application/rss+xml" title="Blog – Stamm Edelweißpiraten" href="/blog/rss.xml" />
</svelte:head>

<div class="flex min-h-screen flex-col bg-page text-body">
    <a href="#inhalt" class="skip-link">Zum Inhalt springen</a>
    <SiteBanner banners={barBanners} />
    <Navbar groups={data.groups} />
    <main id="inhalt" tabindex="-1" class="flex-grow focus:outline-none">
        <slot />
    </main>
    <Footer />
</div>
