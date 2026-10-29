<svelte:options namespace="svg" />

<script lang="ts">
	let { d }: { d: string } = $props()
</script>

<path {d} stroke="black" fill="transparent" stroke-width={2} />
