<script lang="ts">
	import { HTMLContainer } from '@svelte-draw/svelte'

	let { width, height }: { width: number; height: number } = $props()
</script>

<HTMLContainer style="background-color: #efefef; width: {width}px; height: {height}px;" />
