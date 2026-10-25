<script>
    import GroupPage from '$lib/components/GroupPage.svelte';

    export let data;
</script>

<GroupPage group={data.group} events={data.events} galleries={data.galleries} />
