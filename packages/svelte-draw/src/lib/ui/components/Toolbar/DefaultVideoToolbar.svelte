<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface TLUiVideoToolbarProps {
		children?: Snippet
	}
</script>

<script lang="ts">
	import type { Editor, TLVideoShape } from '@svelte-draw/editor'
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import DefaultVideoToolbarInner from './DefaultVideoToolbarInner.svelte'

	/** @public */
	let { children }: TLUiVideoToolbarProps = $props()

	const editor = getEditor()

	function getVideoShapeId(editor: Editor) {
		const onlySelectedShape = editor.getOnlySelectedShape()
		if (!onlySelectedShape || onlySelectedShape.type !== 'video') return null
		return onlySelectedShape.id as TLVideoShape['id']
	}

	const videoShapeId = fromComputed('videoShape', () => getVideoShapeId(editor))
	// `track` made the React component re-render when this changed.
	const showToolbar = fromComputed('showToolbar', () =>
		editor.isInAny('select.idle', 'select.pointing_shape')
	)
	// Reads the id itself, rather than `videoShapeId.current`, because Svelte reads are not
	// tracked inside a signal computation.
	const isLocked = fromComputed('locked', () => {
		const id = getVideoShapeId(editor)
		return id ? editor.getShape<TLVideoShape>(id)?.isLocked : false
	})
</script>

{#if videoShapeId.current && showToolbar.current && !isLocked.current}
	{#key videoShapeId.current}
		<DefaultVideoToolbarInner videoShapeId={videoShapeId.current} {children} />
	{/key}
{/if}
