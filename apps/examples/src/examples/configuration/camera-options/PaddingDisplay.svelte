<script lang="ts">
	import { fromComputed, getEditor } from 'svelte-draw'

	const editor = getEditor()
	const cameraOptions = fromComputed('cameraOptions', () => editor.getCameraOptions())

	const padding = $derived(cameraOptions.current.constraints?.padding)
</script>

{#if padding}
	<div
		style:position="absolute"
		style:top="{padding.y}px"
		style:left="{padding.x}px"
		style:width="calc(100% - {padding.x * 2}px)"
		style:height="calc(100% - {padding.y * 2}px)"
		style:border="1px dotted var(--tl-color-text)"
		style:pointer-events="none"
	></div>
{/if}
