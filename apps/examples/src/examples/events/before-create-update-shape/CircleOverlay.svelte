<script lang="ts">
	import { SVGContainer } from '@svelte-draw/svelte'

	let { radius = 500 }: { radius?: number } = $props()
</script>

<SVGContainer>
	<circle cx={0} cy={0} r={radius} fill="none" stroke="black" />
</SVGContainer>
