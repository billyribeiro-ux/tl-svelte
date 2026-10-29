<script lang="ts">
	import { HTMLContainer } from '@svelte-draw/svelte'

	let { w, h }: { w: number; h: number } = $props()

	// [1]
	let imageUrl = $state<string | null>(null)
	let isDragOver = $state(false)

	$effect(() => {
		const url = imageUrl
		if (!url) return
		return () => URL.revokeObjectURL(url)
	})

	// [2]
	function onDragOver(e: DragEvent) {
		e.preventDefault()
		e.stopPropagation()
		isDragOver = true
	}

	function onDrop(e: DragEvent) {
		e.preventDefault()
		e.stopPropagation()
		isDragOver = false
		// [3]
		const file = Array.from(e.dataTransfer?.files ?? []).find((f) => f.type.startsWith('image/'))
		if (file) imageUrl = URL.createObjectURL(file)
	}
</script>

<HTMLContainer
	class={['drop-zone', isDragOver && 'drop-zone__over']}
	style="width: {w}px; height: {h}px"
	ondragover={onDragOver}
	ondragleave={() => (isDragOver = false)}
	ondrop={onDrop}
>
	{#if imageUrl}
		<img src={imageUrl} alt="" />
	{:else}
		<span>Drop an image here</span>
	{/if}
</HTMLContainer>
