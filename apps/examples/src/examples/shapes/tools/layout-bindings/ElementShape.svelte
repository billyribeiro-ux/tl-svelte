<script lang="ts">
	import { HTMLContainer } from '@svelte-draw/svelte'

	let { color }: { color: string } = $props()
</script>

<HTMLContainer style="background-color: {color};"></HTMLContainer>
