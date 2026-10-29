<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiImageToolbarProps {
		children?: Snippet
	}
</script>

<script lang="ts">
	import type { Editor, TLImageShape } from '@svelte-draw/editor'
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import DefaultImageToolbarInner from './DefaultImageToolbarInner.svelte'

	/** @public */
	let { children }: TLUiImageToolbarProps = $props()

	const editor = getEditor()

	function getImageShapeId(editor: Editor) {
		const onlySelectedShape = editor.getOnlySelectedShape()
		if (!onlySelectedShape || onlySelectedShape.type !== 'image') return null
		return onlySelectedShape.id as TLImageShape['id']
	}

	const imageShapeId = fromComputed('imageShape', () => getImageShapeId(editor))
	const showToolbar = fromComputed('showToolbar', () =>
		editor.isInAny('select.idle', 'select.pointing_shape', 'select.crop')
	)
	// Reads the id itself, rather than `imageShapeId.current`, because Svelte reads are not
	// tracked inside a signal computation.
	const isLocked = fromComputed('locked', () => {
		const id = getImageShapeId(editor)
		return id ? editor.getShape<TLImageShape>(id)?.isLocked : false
	})
</script>

{#if imageShapeId.current && showToolbar.current && !isLocked.current}
	{#key imageShapeId.current}
		<DefaultImageToolbarInner imageShapeId={imageShapeId.current} {children} />
	{/key}
{/if}
