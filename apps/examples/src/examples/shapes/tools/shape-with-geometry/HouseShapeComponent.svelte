<script lang="ts">
	let { d }: { d: string } = $props()
</script>

<svg class="tl-svg-container">
	<path stroke-width={3} stroke="black" {d} fill="none" />
</svg>
