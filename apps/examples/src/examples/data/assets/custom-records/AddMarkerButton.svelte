<script lang="ts">
	import { SvelteDrawUiButton, SvelteDrawUiButtonLabel, getEditor } from 'svelte-draw'
	import { ICONS, MARKER_TYPE, createMarkerId } from './marker'

	const editor = getEditor()

	function addMarker() {
		const label = prompt('Marker label:')
		if (!label) return
		const point = editor.getViewportPageBounds().center
		editor.store.put([
			{
				id: createMarkerId(),
				typeName: MARKER_TYPE,
				x: point.x,
				y: point.y,
				label,
				icon: ICONS[Math.floor(Math.random() * ICONS.length)],
			},
		])
	}
</script>

<div class="tlui-menu" style="pointer-events: all">
	<SvelteDrawUiButton type="normal" onclick={addMarker}>
		<SvelteDrawUiButtonLabel>Add marker</SvelteDrawUiButtonLabel>
	</SvelteDrawUiButton>
</div>
