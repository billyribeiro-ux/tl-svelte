<script lang="ts">
	import { getSvelteDrawUiOrientation } from '../layout.svelte'

	let { name }: { name: string } = $props()
	const ctx = getSvelteDrawUiOrientation()
</script>

<span data-testid={name} data-orientation={ctx.orientation} data-tooltip-side={ctx.tooltipSide}></span>
