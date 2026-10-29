<script lang="ts">
	import { fromComputed, getEditor } from 'svelte-draw'

	const editor = getEditor()

	// [1]
	const score = fromComputed('score', () => {
		let score = 0
		for (const shape of editor.getCurrentPageShapes()) {
			if (!editor.isShapeOfType(shape, 'exam-mark')) continue
			score += shape.props.score
		}
		return score
	})
</script>

<div
	style="background: var(--tl-color-panel); display: flex; align-items: center; justify-content: center; padding: 0.5rem 1rem; border-radius: 6px; margin: 6px 0px 0px 0px; border-width: 2px; border-style: solid; border-color: var(--tl-color-background-contrast); z-index: var(--tl-layer-panels);"
>
	<p style="font-size: 1.25em; margin: 0;">Total exam score: {score.current}</p>
</div>

<!--
[1]
`fromComputed` re-runs this computation whenever a shape it read changes, so the total tracks
every exam mark that is added, edited, or deleted with no manual subscription.
-->
