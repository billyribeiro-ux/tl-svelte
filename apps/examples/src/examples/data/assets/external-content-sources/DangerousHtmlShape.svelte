<script lang="ts">
	import { HTMLContainer } from 'svelte-draw'

	let { html }: { html: string } = $props()
</script>

<HTMLContainer style="overflow: auto">
	<!-- It's called "dangerous" for a reason: never render HTML you don't trust. -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	<div>{@html html}</div>
</HTMLContainer>
