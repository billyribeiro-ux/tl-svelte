<script lang="ts">
	import { HTMLContainer } from '@svelte-draw/svelte'

	let { fill }: { fill: string } = $props()
</script>

<HTMLContainer style="background-color: {fill}" />
