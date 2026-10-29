<script lang="ts">
	import { isCursorInViewport, type TLInstancePresence } from '@svelte-draw/editor'
	import { getEditor } from '../context/editor'
	import { fromComputed } from '../state/fromSignal'
	import { getEditorComponents } from './componentsContext'

	let { latestPresence }: { latestPresence: TLInstancePresence } = $props()

	const editor = getEditor()
	const components = getEditorComponents()

	const userId = $derived(latestPresence.userId)
	const chatMessage = $derived(latestPresence.chatMessage)
	const userName = $derived(latestPresence.userName)
	const cursor = $derived(latestPresence.cursor)
	const color = $derived(latestPresence.color)

	// The viewport read lives inside this equality-gated computed rather than the render:
	// pans move the viewport every frame, but this component only needs to know when the cursor
	// crosses the edge, so it subscribes to the boolean and re-renders only when it flips.
	const cursorInViewport = $derived.by(() => {
		const currentCursor = cursor
		return fromComputed(
			'cursor in viewport',
			() =>
				!!currentCursor &&
				isCursorInViewport(currentCursor, editor.getViewportPageBounds(), editor.getZoomLevel())
		)
	})
	// The zoom read is tracked directly: the cursor scales by 1/zoom, so zoom changes must
	// re-render it. Pure pans leave the zoom value unchanged, so they never invalidate this.
	const zoomLevel = fromComputed('zoom level', () => editor.getZoomLevel())
</script>

<!-- Off-viewport collaborators show as the canvas-drawn hint arrows
(CollaboratorHintOverlayUtil), which shares this predicate — only the cursor itself is DOM. -->
{#if cursor && cursorInViewport.current && components.CollaboratorCursor}
	{@const CollaboratorCursor = components.CollaboratorCursor}
	<CollaboratorCursor
		class="tl-collaborator__cursor"
		{userId}
		point={cursor}
		{color}
		zoom={zoomLevel.current}
		name={userName !== 'New User' ? userName : null}
		chatMessage={chatMessage ?? ''}
	/>
{/if}
