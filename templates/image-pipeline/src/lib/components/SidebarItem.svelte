<script lang="ts">
	import {
		getPointerInfo,
		onDragFromToolbarToCreateShape,
		Vec,
		type Editor,
		type TLUiIconJsx,
	} from 'svelte-draw'
	import { createNodeAtCenter } from './createNodeAtCenter'
	import type { NodeType } from '../nodes/nodeTypes'

	const DRAG_DISTANCE_SQ = 36 // 6px

	let {
		editor,
		title,
		icon,
		getDefault,
	}: {
		editor: Editor
		title: string
		icon: TLUiIconJsx
		getDefault: () => NodeType
	} = $props()

	// Plain (non-reactive) interaction state, like the React `useRef` it replaces.
	let state:
		| { name: 'idle' }
		| { name: 'pointing'; start: { x: number; y: number } }
		| { name: 'dragging' }
		| { name: 'dragged' } = { name: 'idle' }
</script>

<button
	class="ImagePipelineSidebar-item"
	onpointerdown={(e) => {
		state = {
			name: 'pointing',
			start: { x: e.clientX, y: e.clientY },
		}
		e.currentTarget.setPointerCapture(e.pointerId)
	}}
	onpointermove={(e) => {
		if (state.name === 'pointing') {
			const dist = Vec.Dist2(state.start, {
				x: e.clientX,
				y: e.clientY,
			})
			if (dist > DRAG_DISTANCE_SQ) {
				const start = state.start
				state = { name: 'dragging' }

				editor.run(() => {
					editor.setCurrentTool('select')
					editor.dispatch({
						type: 'pointer',
						target: 'canvas',
						name: 'pointer_down',
						...getPointerInfo(editor, e),
						point: start,
					})
					editor.selectNone()
					onDragFromToolbarToCreateShape(
						editor,
						{
							type: 'pointer',
							target: 'canvas',
							name: 'pointer_move',
							...getPointerInfo(editor, e),
							point: start,
						},
						{
							createShape: (id) => {
								editor.createShape({
									id,
									type: 'node',
									props: { node: getDefault() },
								})
							},
						}
					)
					editor.getContainer().focus()
				})
			}
		}
	}}
	onpointerup={(e) => {
		e.currentTarget.releasePointerCapture(e.pointerId)
		if (state.name === 'dragging') {
			editor.dispatch({
				type: 'pointer',
				target: 'canvas',
				name: 'pointer_up',
				...getPointerInfo(editor, e),
			})
			state = { name: 'dragged' }
			return
		}
		state = { name: 'idle' }
	}}
	onclick={() => {
		if (state.name === 'dragged') {
			state = { name: 'idle' }
			return
		}
		state = { name: 'idle' }
		createNodeAtCenter(editor, getDefault())
	}}
>
	<span class="ImagePipelineSidebar-item-icon">{@render icon({ props: {} })}</span>
	<span class="ImagePipelineSidebar-item-title">{title}</span>
</button>
