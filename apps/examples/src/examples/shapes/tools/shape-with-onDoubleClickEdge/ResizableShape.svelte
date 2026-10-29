<script lang="ts">
	import { HTMLContainer } from '@svelte-draw/svelte'

	let { w, h }: { w: number; h: number } = $props()
</script>

<HTMLContainer
	style="background-color: #e6f0ff; border: 2px solid #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; color: #1e3a8a; text-align: center; padding: 8px;"
>
	{w} × {h}
</HTMLContainer>
