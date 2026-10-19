<script>
    import '../app.css';
    import Navbar from '$lib/components/Navbar.svelte';
    import Footer from '$lib/components/Footer.svelte';
    import Instagram from '$lib/components/Instagram.svelte';

    export let data;
</script>

<div class="min-h-screen flex flex-col">
    <Navbar groups={data.groups} />
    <main class="flex-grow">
        <slot />
        <Instagram />
    </main>
    <Footer />
</div>

