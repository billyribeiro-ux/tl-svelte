<script lang="ts">
	import capitalize from 'lodash/capitalize'
	import { fromComputed, getEditor, type Editor, type TLShapeId } from 'svelte-draw'
	import ShapeList from './ShapeList.svelte'

	const selectedBg = '#E8F4FE'
	const childSelectedBg = '#F3F9FE'
	const childBg = '#00000006'

	let {
		shapeId,
		depth,
		parentIsSelected,
		parentIsHidden,
	}: {
		shapeId: TLShapeId
		depth: number
		parentIsSelected?: boolean
		parentIsHidden?: boolean
	} = $props()

	const editor = getEditor()

	// The parent keys this component by shape id, so the id never changes for an instance.
	// svelte-ignore state_referenced_locally
	const id = shapeId
	const shape = fromComputed('shape', () => editor.getShape(id))
	const children = fromComputed('children', () => editor.getSortedChildIdsForParent(id))
	const isHidden = fromComputed('isHidden', () => editor.isShapeHidden(id))
	const isSelected = fromComputed('isSelected', () => editor.getSelectedShapeIds().includes(id))
	const shapeName = fromComputed('shapeName', () => getShapeName(editor, id))

	let isEditingName = $state(false)

	let timeSinceLastVisibilityToggle = Date.now()

	function getShapeName(editor: Editor, shapeId: TLShapeId) {
		const shape = editor.getShape(shapeId)
		if (!shape) return 'Unknown shape'
		return (
			(shape.meta.name as string) ||
			editor.getShapeUtil(shape).getText(shape) ||
			capitalize(shape.type + ' shape')
		)
	}

	const background = $derived(
		isSelected.current
			? selectedBg
			: parentIsSelected
				? childSelectedBg
				: depth > 0
					? childBg
					: undefined
	)
</script>

{#snippet visibilityOff()}
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width="16px" fill="#5f636895">
		<path
			d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z"
		/>
	</svg>
{/snippet}

{#snippet visibilityOn()}
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width="16px" fill="#5f636895">
		<path
			d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"
		/>
	</svg>
{/snippet}

{#if shape.current}
	{@const currentShape = shape.current}
	<div
		class="shape-item"
		role="treeitem"
		tabindex="-1"
		aria-selected={isSelected.current}
		ondblclick={() => {
			isEditingName = true
		}}
		onpointerdown={() => {
			if (editor.inputs.getCtrlKey() || editor.inputs.getShiftKey()) {
				if (isSelected.current) {
					editor.deselect(currentShape)
				} else {
					editor.select(...editor.getSelectedShapes(), currentShape)
				}
			} else {
				editor.select(currentShape)
			}
		}}
		style:padding-left="{10 + depth * 20}px"
		style:opacity={isHidden.current ? 0.5 : 1}
		style:background
	>
		{#if isEditingName}
			<!-- svelte-ignore a11y_autofocus -->
			<input
				autofocus
				class="shape-name-input"
				value={shapeName.current}
				onblur={() => (isEditingName = false)}
				oninput={(ev) => {
					if (currentShape.type === 'frame') {
						editor.updateShape({ ...currentShape, props: { name: ev.currentTarget.value } })
					} else {
						editor.updateShape({ ...currentShape, meta: { name: ev.currentTarget.value } })
					}
				}}
				onkeydown={(ev) => {
					if (ev.key === 'Enter' || ev.key === 'Escape') {
						ev.currentTarget.blur()
					}
				}}
			/>
		{:else}
			<div class="shape-name">{shapeName.current}</div>
		{/if}
		<button
			class="shape-visibility-toggle"
			onpointerdown={(ev) => {
				// Don't let the click also select the row.
				ev.stopPropagation()
				const now = Date.now()
				if (now - timeSinceLastVisibilityToggle < 200) {
					editor.updateShape({
						...currentShape,
						meta: { hidden: false, force_show: true },
					})
					timeSinceLastVisibilityToggle = 0
				} else {
					editor.updateShape({
						...currentShape,
						meta: { hidden: !currentShape.meta.hidden, force_show: false },
					})
					timeSinceLastVisibilityToggle = now
				}
			}}
		>
			{#if currentShape.meta.hidden}
				{@render visibilityOff()}
			{:else}
				{@render visibilityOn()}
			{/if}
		</button>
	</div>
	{#if children.current.length}
		<ShapeList
			shapeIds={children.current}
			depth={depth + 1}
			parentIsHidden={parentIsHidden || isHidden.current}
			parentIsSelected={parentIsSelected || isSelected.current}
		/>
	{/if}
{/if}
