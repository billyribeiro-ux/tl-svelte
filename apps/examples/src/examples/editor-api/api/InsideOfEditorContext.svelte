<script lang="ts" module>
	export const STEP_MS = 1000
	export const TIMELINE_MS = STEP_MS * 5
</script>

<script lang="ts">
	import { DefaultColorStyle, getEditor } from 'svelte-draw'

	// [2]
	const editor = getEditor()

	$effect(() => {
		let i = 0
		let interval: ReturnType<typeof setInterval> | undefined

		// Wait for the onMount timeline to finish so the color cycle doesn't
		// interrupt the staged setup.
		const start = setTimeout(() => {
			interval = setInterval(() => {
				const selection = [...editor.getSelectedShapeIds()]
				editor.selectAll()
				editor.setStyleForSelectedShapes(DefaultColorStyle, i % 2 ? 'blue' : 'light-blue')
				editor.setStyleForNextShapes(DefaultColorStyle, i % 2 ? 'blue' : 'light-blue')
				editor.setSelectedShapes(selection)
				i++
			}, STEP_MS)
		}, TIMELINE_MS)

		return () => {
			clearTimeout(start)
			if (interval) clearInterval(interval)
		}
	})
</script>
