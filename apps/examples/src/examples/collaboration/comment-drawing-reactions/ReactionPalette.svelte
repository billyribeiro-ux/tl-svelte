<script lang="ts">
	import { getLicenseKey } from '@svelte-draw/dotcom-shared'
	import { getEditor } from 'svelte-draw'
	import DrawingReactionPalette from './DrawingReactionPalette.svelte'
	import { saveDrawingReaction, type DrawingReactionPaletteProps } from './drawingReactions'

	let props: DrawingReactionPaletteProps = $props()

	const editor = getEditor()
	const saveDrawing = (src: string) => saveDrawingReaction(editor, src)
</script>

<DrawingReactionPalette {...props} licenseKey={getLicenseKey()} {saveDrawing} />
