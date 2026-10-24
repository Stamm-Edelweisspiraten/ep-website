<script>
    import '../app.css';
    import Navbar from '$lib/components/Navbar.svelte';
    import Footer from '$lib/components/Footer.svelte';

    export let data;
</script>

<div class="flex min-h-screen flex-col bg-page text-body">
    <Navbar groups={data.groups} />
    <main class="flex-grow">
        <slot />
    </main>
    <Footer />
</div>
