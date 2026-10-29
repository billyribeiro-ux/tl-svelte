<script lang="ts">
	import { HTMLContainer } from '@svelte-draw/svelte'
	import { fromComputed, getEditor, type TLShapePartial } from 'svelte-draw'
	import {
		FLEX_CONTAINER_DEFAULT_LABEL,
		FLEX_CONTAINER_GAP,
		FLEX_CONTAINER_PADDING,
		flexStyleToString,
		getFlexContainerStyles,
	} from './FlexContainerHelpers'
	import {
		type FlexLayoutShape,
		getContainerHeadingSide,
		getContainerHeadingTranslation,
		getDropIndicator,
		getFlexLayoutChildren,
		getIsTranslatingSelectedChild,
		resizeFlexLayoutToChildren,
	} from './flexLayoutLogic'

	let { shape }: { shape: FlexLayoutShape } = $props()

	const editor = getEditor()
	const label = FLEX_CONTAINER_DEFAULT_LABEL

	// The heading (FlexContainerHeading)
	const heading = $derived(
		fromComputed('flex container heading', () => {
			const labelSide = getContainerHeadingSide(editor, shape)
			return {
				side: labelSide,
				translation: getContainerHeadingTranslation(shape, labelSide),
			}
		})
	)

	// [5]
	let measureEl = $state<HTMLDivElement | null>(null)

	// The placeholder divs, one per child, at the child's size.
	const placeholders = $derived(
		fromComputed('flex layout children', () =>
			getFlexLayoutChildren(editor, shape.id).map((child) => {
				const bounds = editor.getShapeGeometry(child).bounds
				return {
					id: child.id,
					x: child.x,
					y: child.y,
					width: bounds.width,
					height: bounds.height,
				}
			})
		)
	)
	const layoutKey = $derived(
		placeholders.current.map((c) => `${c.id}:${c.x}:${c.y}:${c.width}:${c.height}`).join('|')
	)
	const dropIndicator = $derived(
		fromComputed('flex layout drop indicator', () =>
			getDropIndicator(editor, shape, getFlexLayoutChildren(editor, shape.id))
		)
	)
	const isTranslatingSelectedChild = $derived(
		fromComputed('flex layout is translating selected child', () =>
			getIsTranslatingSelectedChild(editor, shape)
		)
	)

	// Runs after the DOM has updated (the old `useLayoutEffect`).
	$effect(() => {
		void shape
		void layoutKey
		if (isTranslatingSelectedChild.current) return

		const measureElm = measureEl
		if (!measureElm) return

		resizeFlexLayoutToChildren(editor, shape.id)

		function updateChildrenFromFlexbox() {
			if (!measureElm) return
			const updates: TLShapePartial[] = Array.from(
				measureElm.querySelectorAll<HTMLElement>('[data-shape-id]')
			).flatMap((childElm) => {
				const childId = childElm.dataset.shapeId as typeof shape.id | undefined
				if (!childId) return []
				const child = editor.getShape(childId)
				if (!child || child.parentId !== shape.id) return []
				const x = childElm.offsetLeft
				const y = childElm.offsetTop
				if (Math.abs(child.x - x) < 0.5 && Math.abs(child.y - y) < 0.5) return []
				return [{ id: child.id, type: child.type, x, y } as TLShapePartial]
			})

			if (updates.length) {
				editor.updateShapes(updates)
			}
		}

		updateChildrenFromFlexbox()
		const observer = new ResizeObserver(updateChildrenFromFlexbox)
		observer.observe(measureElm)
		for (const childElm of measureElm.querySelectorAll<HTMLElement>('[data-shape-id]')) {
			observer.observe(childElm)
		}
		return () => observer.disconnect()
	})
</script>

<div
	class="tl-frame-heading"
	style:overflow="hidden"
	style:max-width="calc(var(--tl-zoom) * {heading.current.side === 0 || heading.current.side === 2
		? Math.ceil(shape.props.w)
		: Math.ceil(shape.props.h)}px + var(--tl-frame-offset-width))"
	style:bottom="100%"
	style:transform="{heading.current
		.translation} scale(min(var(--tl-scale), 3.5)) translateX(-7px)"
>
	<div
		class="tl-frame-heading-hit-area flex-layout-heading__label"
		style="color: var(--tl-color-text-1); background-color: #fff; box-shadow: inset 0px 0px 0px 1px var(--tl-color-muted-1);"
	>
		{label}
	</div>
</div>

<HTMLContainer
	class="flex-layout-shape"
	data-drop-active={!!dropIndicator.current}
	style="width: {shape.props.w}px; height: {shape.props.h}px;"
>
	<div
		bind:this={measureEl}
		class="flex-layout-shape__measure"
		style="width: {shape.props.w}px; height: {shape.props.h}px; padding: {FLEX_CONTAINER_PADDING}px; gap: {FLEX_CONTAINER_GAP}px; {flexStyleToString(
			getFlexContainerStyles(shape)
		)}"
	>
		{#each placeholders.current as child (child.id)}
			<div
				data-shape-id={child.id}
				style="width: {child.width}px; height: {child.height}px;"
			></div>
		{/each}
	</div>
	{#if dropIndicator.current}
		<div
			class="flex-layout-shape__drop-line"
			data-direction={shape.props.direction}
			data-drop-type={dropIndicator.current.type}
			style={flexStyleToString(dropIndicator.current.style)}
		></div>
	{/if}
</HTMLContainer>
