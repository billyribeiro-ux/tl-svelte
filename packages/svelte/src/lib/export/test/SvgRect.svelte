<svelte:options namespace="svg" />

<script lang="ts">
	let { w, h }: { w: number; h: number } = $props()
</script>

<rect width={w} height={h} fill="red" data-testid="svg-rect" />
