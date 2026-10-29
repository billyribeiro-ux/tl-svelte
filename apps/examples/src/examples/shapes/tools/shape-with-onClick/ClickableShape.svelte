<script lang="ts">
	import { HTMLContainer } from '@svelte-draw/svelte'

	let { count }: { count: number } = $props()
</script>

<HTMLContainer
	style="background-color: #f0e6ff; border: 2px solid #9b59b6; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; color: #333;"
>
	Clicks: {count}
</HTMLContainer>
