<script lang="ts">
	import {
		Box,
		SvelteDrawUiButtonIcon,
		SvelteDrawUiContextualToolbar,
		SvelteDrawUiToolbarButton,
		type TLShapePartial,
		fromComputed,
		getEditor,
	} from 'svelte-draw'
	import type { FlexContainerLayoutProps } from './FlexContainerHelpers'
	import {
		FLEX_LAYOUT_SHAPE_TYPE,
		type FlexLayoutShape,
		relayoutFlexLayoutChildren,
	} from './flexLayoutLogic'

	// [6]
	const editor = getEditor()
	const shape = fromComputed('selected flex layout shape', () => {
		if (!editor.isIn('select.idle')) return null
		const onlySelectedShape = editor.getOnlySelectedShape()
		return onlySelectedShape?.type === FLEX_LAYOUT_SHAPE_TYPE
			? (onlySelectedShape as FlexLayoutShape)
			: null
	})

	function updateLayoutProps(current: FlexLayoutShape, props: Partial<FlexContainerLayoutProps>) {
		editor.run(() => {
			editor.updateShapes([{ id: current.id, type: current.type, props } as TLShapePartial])
			relayoutFlexLayoutChildren(editor, current.id)
		})
		editor.getContainer().focus()
	}

	const getSelectionBounds = () => {
		const bounds = editor.getSelectionRotatedScreenBounds()
		if (!bounds) return undefined
		return new Box(bounds.x, bounds.y, bounds.width, 0)
	}

	function getButtons(current: FlexLayoutShape) {
		const isHorizontal = current.props.direction === 'horizontal'
		const { direction, justify, align } = current.props
		const update = (props: Partial<FlexContainerLayoutProps>) => () =>
			updateLayoutProps(current, props)
		return [
			{
				title: 'Horizontal',
				active: direction === 'horizontal',
				icon: 'stack-horizontal',
				onSelect: update({ direction: 'horizontal' }),
			},
			{
				title: 'Vertical',
				active: direction === 'vertical',
				icon: 'stack-vertical',
				onSelect: update({ direction: 'vertical' }),
			},
			{
				title: isHorizontal ? 'Align left' : 'Align top',
				active: justify === 'start',
				icon: isHorizontal ? 'horizontal-align-start' : 'vertical-align-start',
				onSelect: update({ justify: 'start' }),
			},
			{
				title: isHorizontal ? 'Align center' : 'Align middle',
				active: justify === 'center',
				icon: isHorizontal ? 'horizontal-align-middle' : 'vertical-align-middle',
				onSelect: update({ justify: 'center' }),
			},
			{
				title: isHorizontal ? 'Align right' : 'Align bottom',
				active: justify === 'end',
				icon: isHorizontal ? 'horizontal-align-end' : 'vertical-align-end',
				onSelect: update({ justify: 'end' }),
			},
			{
				title: isHorizontal ? 'Distribute horizontally' : 'Distribute vertically',
				active: justify === 'space-between',
				icon: isHorizontal ? 'distribute-horizontal' : 'distribute-vertical',
				onSelect: update({ justify: 'space-between' }),
			},
			{
				title: isHorizontal ? 'Align top' : 'Align left',
				active: align === 'start',
				icon: isHorizontal ? 'vertical-align-start' : 'horizontal-align-start',
				onSelect: update({ align: 'start' }),
			},
			{
				title: isHorizontal ? 'Align middle' : 'Align center',
				active: align === 'center',
				icon: isHorizontal ? 'vertical-align-middle' : 'horizontal-align-middle',
				onSelect: update({ align: 'center' }),
			},
			{
				title: isHorizontal ? 'Align bottom' : 'Align right',
				active: align === 'end',
				icon: isHorizontal ? 'vertical-align-end' : 'horizontal-align-end',
				onSelect: update({ align: 'end' }),
			},
		]
	}
</script>

{#if shape.current}
	<SvelteDrawUiContextualToolbar {getSelectionBounds} label="Flex layout">
		{#each getButtons(shape.current) as button (button.title)}
			<SvelteDrawUiToolbarButton
				type="icon"
				title={button.title}
				isActive={button.active}
				onclick={button.onSelect}
			>
				<SvelteDrawUiButtonIcon small icon={button.icon} />
			</SvelteDrawUiToolbarButton>
		{/each}
	</SvelteDrawUiContextualToolbar>
{/if}
