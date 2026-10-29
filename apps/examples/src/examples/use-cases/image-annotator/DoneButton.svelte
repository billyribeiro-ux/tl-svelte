<script lang="ts">
	import { getEditor } from 'svelte-draw'
	import { getAnnotator } from './annotatorContext'

	const editor = getEditor()
	const { imageShapeId, onDone } = getAnnotator()
</script>

<button
	class="DoneButton"
	onclick={async () => {
		// [6]
		const { blob } = await editor.toImage([...editor.getCurrentPageShapeIds()], {
			format: 'png',
			background: true,
			bounds: editor.getShapePageBounds(imageShapeId)!,
			padding: 0,
			scale: 1,
		})

		onDone(blob)
	}}
>
	Done
</button>

<!--
[6]
`editor.toImage` with `bounds` set to the image's page bounds crops the export to exactly the
image, including any annotations that overlap it.
-->
