<script lang="ts">
	import { Vec, fromComputed, getEditor } from 'svelte-draw'

	const editor = getEditor()
	const cameraOptions = fromComputed('cameraOptions', () => editor.getCameraOptions())

	const colB = '#00000002'
	const colA = '#0000001F'

	const bounds = $derived(cameraOptions.current.constraints?.bounds)
	const d = $derived(bounds ? Vec.ToAngle({ x: bounds.w, y: bounds.h }) * (180 / Math.PI) : 0)
</script>

{#if bounds}
	<div
		style:position="absolute"
		style:top="{bounds.y}px"
		style:left="{bounds.x}px"
		style:width="{bounds.w}px"
		style:height="{bounds.h}px"
		style:border="1px dashed var(--tl-color-text)"
	>
		<!-- grey and white stripes -->
		<div
			style:position="absolute"
			style:top="0"
			style:left="0"
			style:width="100%"
			style:height="100%"
			style:background-image="
				linear-gradient(0deg, {colB} 0%, {colA} 50%, {colB} 50%, {colA} 100%),
				linear-gradient(90deg, {colB} 0%, {colA} 50%, {colB} 50%, {colA} 100%),
				linear-gradient({d}deg, {colB} 0%, {colA} 50%, {colB} 50%, {colA} 100%),
				linear-gradient(-{d}deg, {colB} 0%, {colA} 50%, {colB} 50%, {colA} 100%)"
		></div>
	</div>
{/if}
