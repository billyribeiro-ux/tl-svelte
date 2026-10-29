<script lang="ts">
	import { fromComputed, getEditor } from 'svelte-draw'
	import type { Layout } from './layout'
	import { zoomAtCentre, zoomRange } from './navigation'

	/**
	 * A zoom control for a range no wheel makes obvious. Reading a whole work takes
	 * a couple of hundred times magnification, so the slider is logarithmic: each
	 * equal step along it is an equal multiple of zoom, which makes the levels come
	 * past at an even rate rather than all bunched at one end.
	 */
	let { layout }: { layout: Layout } = $props()

	const editor = getEditor()
	const range = $derived(zoomRange(layout))
	const span = $derived(Math.log(range[1] / range[0]))

	const position = fromComputed('zoom position', () => {
		const zoom = editor.getZoomLevel()
		return Math.min(1, Math.max(0, Math.log(zoom / range[0]) / span))
	})
</script>

<label class="sz-zoom" title="Zoom">
	<span class="sz-zoom-end">whole</span>
	<input
		type="range"
		min={0}
		max={1}
		step={0.001}
		value={position.current}
		oninput={(e) =>
			zoomAtCentre(editor, layout, range[0] * Math.exp(span * e.currentTarget.valueAsNumber))}
	/>
	<span class="sz-zoom-end">detail</span>
</label>
