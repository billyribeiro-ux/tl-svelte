<script lang="ts">
	import { HTMLContainer, getEditor } from '@svelte-draw/svelte'
	import type { TLShapeId } from 'svelte-draw'
	import { nativeEvents } from '../../nativeEvents'
	import { MY_INTERACTIVE_SHAPE_TYPE } from './my-interactive-shape-util'

	let {
		id,
		w,
		h,
		checked,
		text,
	}: { id: TLShapeId; w: number; h: number; checked: boolean; text: string } = $props()

	const editor = getEditor()

	// [b] This is where we stop event propagation
	const stop = (e: Event) => e.stopPropagation()
	const checkboxEvents = nativeEvents({ pointerdown: stop, touchstart: stop, touchend: stop })

	// [c] While the todo is unchecked the text input handles its own pointer events.
	const stopIfUnchecked = (e: Event) => {
		if (!checked) e.stopPropagation()
	}
	const textEvents = nativeEvents({
		pointerdown: stopIfUnchecked,
		touchstart: stopIfUnchecked,
		touchend: stopIfUnchecked,
	})
</script>

<!-- [a] This is where we allow pointer events on our shape -->
<HTMLContainer
	style="padding: 16px; height: {h}px; width: {w}px; pointer-events: all; background-color: #efefef; overflow: hidden;"
>
	<input
		type="checkbox"
		{checked}
		onchange={() =>
			editor.updateShape({ id, type: MY_INTERACTIVE_SHAPE_TYPE, props: { checked: !checked } })}
		{@attach checkboxEvents}
	/>
	<input
		type="text"
		placeholder="Enter a todo..."
		readonly={checked}
		value={text}
		oninput={(e) =>
			editor.updateShape({
				id,
				type: MY_INTERACTIVE_SHAPE_TYPE,
				props: { text: e.currentTarget.value },
			})}
		{@attach textEvents}
	/>
</HTMLContainer>
