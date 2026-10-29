<script lang="ts">
	import { getEditor, HTMLContainer, type TLShapeId } from 'svelte-draw'
	import type { Attachment } from 'svelte/attachments'
	import { on } from 'svelte/events'

	let { shapeId, count }: { shapeId: TLShapeId; count: number } = $props()

	const editor = getEditor()

	const onClick = (event: Event, change: number) => {
		event.stopPropagation()
		const shape = editor.getShape(shapeId)
		if (!shape) return
		editor.updateShape({
			id: shapeId,
			type: 'counter',
			props: { count: (shape.props as { count: number }).count + change },
		})
	}

	// Svelte delegates `click` and `pointerdown` to the app root, which runs after the editor
	// container's native listeners. Both handlers have to beat them, so they are native listeners.
	function button(change: number): Attachment<HTMLButtonElement> {
		return (element) => {
			const offClick = on(element, 'click', (e) => onClick(e, change))
			const offPointerDown = on(element, 'pointerdown', editor.markEventAsHandled)
			return () => {
				offClick()
				offPointerDown()
			}
		}
	}
</script>

<HTMLContainer
	style="pointer-events: all; background: #efefef; display: flex; align-items: center; justify-content: center; gap: 8px;"
>
	<button {@attach button(-1)}>-</button>
	<span>{count}</span>
	<button {@attach button(1)}>+</button>
</HTMLContainer>
