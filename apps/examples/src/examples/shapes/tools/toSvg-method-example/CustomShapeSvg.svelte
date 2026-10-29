<svelte:options namespace="svg" />

<script lang="ts">
	let { w, h, fill }: { w: number; h: number; fill: string } = $props()
</script>

<rect width={w} height={h} {fill} />
