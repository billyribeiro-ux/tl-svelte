<script lang="ts">
	import { HTMLContainer, getEditor } from '@svelte-draw/svelte'
	import { nativeEvents } from '../../nativeEvents'

	let {
		perspective,
		perspectiveOriginX,
		perspectiveOriginY,
	}: { perspective: number; perspectiveOriginX: number; perspectiveOriginY: number } = $props()

	const editor = getEditor()

	// [1]
	let popped = $state(false)

	// [3] Marked as handled on the native event (before the editor's own listeners run); Svelte's
	// delegated `onpointerdown` / `ondblclick` would run too late.
	const events = nativeEvents({
		pointerdown: (e) => editor.markEventAsHandled(e),
		dblclick: (e) => {
			popped = !popped
			editor.markEventAsHandled(e)
		},
	})
</script>

<HTMLContainer
	style="pointer-events: all; perspective: {perspective}px; perspective-origin: {perspectiveOriginX}px {perspectiveOriginY}px;"
	{@attach events}
>
	<div class="popup-shape-shadow"></div>
	<div class="popup-shape-card" style:transform={popped ? 'rotateX(0deg)' : 'rotateX(20deg)'}></div>
</HTMLContainer>
