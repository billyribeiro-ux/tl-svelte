<script lang="ts">
	import { HTMLContainer } from 'svelte-draw'

	let { title, description }: { title: string; description: string } = $props()
</script>

<HTMLContainer class="card-shape">
	<div class="card-shape-title">{title}</div>
	{#if description}
		<div class="card-shape-description">{description}</div>
	{/if}
</HTMLContainer>
