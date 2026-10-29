<script lang="ts">
	import { HTMLContainer, getEditor, type TLShapeId } from 'svelte-draw'
	import type { Attachment } from 'svelte/attachments'
	import { on } from 'svelte/events'
	import { untrack } from 'svelte'

	let {
		shapeId,
		score,
		isEditing,
	}: { shapeId: TLShapeId; score: number; isEditing: boolean } = $props()

	const editor = getEditor()

	// [b]
	// Seeded once from the shape: the raw text may be empty or "-" mid-edit, so it must not be
	// overwritten by the shape's score while the user types.
	let text = $state<number | string>(untrack(() => score))

	let input = $state.raw<HTMLInputElement | null>(null)

	// [c]
	$effect(() => {
		editor.setEditingShape(shapeId)
	})

	// [d]
	$effect(() => {
		if (isEditing && input) {
			input.focus()
			input.select()
		}
	})

	// [e]
	function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
		const value = e.currentTarget.value
		text = value
		const num = Number(value)
		if (!isNaN(num)) {
			editor.updateShape({
				id: shapeId,
				type: 'exam-mark',
				props: {
					score: num,
				},
			})
		}
	}

	// Svelte delegates `onpointerdown` and `onpointerup` to the app root, which runs after the editor
	// container's native listeners, so marking these events as handled has to happen natively.
	const markHandledWhileEditing: Attachment<HTMLInputElement> = (element) => {
		const handler = (e: PointerEvent) => {
			if (isEditing) editor.markEventAsHandled(e)
		}
		const offs = [
			on(element, 'pointerdown', handler),
			on(element, 'pointerup', handler),
			on(element, 'pointermove', handler),
		]
		return () => offs.forEach((off) => off())
	}
</script>

<HTMLContainer id={shapeId}>
	<div style="height: 100%; font-size: 1.5em; display: flex; align-items: center;">
		<input
			bind:this={input}
			{@attach markHandledWhileEditing}
			type="number"
			value={text}
			style="width: 100%; font-size: 1.25em; padding: 6px 10px; border-radius: 4px; border: 1px solid blue; opacity: 0.7; pointer-events: {isEditing
				? 'all'
				: 'none'};"
			oninput={handleInput}
			onblur={() => {
				editor.setEditingShape(null)
			}}
		/>
	</div>
</HTMLContainer>
