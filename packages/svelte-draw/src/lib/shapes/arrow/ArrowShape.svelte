<script lang="ts">
	import { debugFlags, type TLArrowShape } from '@svelte-draw/editor'
	import { getEditor, SVGContainer } from '@svelte-draw/svelte'
	import { isEmptyRichText } from '../../utils/text/richText'
	import RichTextLabel from '../shared/RichTextLabel.svelte'
	import { getDisplayValues } from '../shared/getDisplayValues'
	import type { ArrowShapeUtil } from './ArrowShapeUtil'
	import { getArrowLabelPosition } from './arrowLabel'
	import ArrowSvg from './ArrowSvg.svelte'
	import ElbowArrowDebug from './elbow/ElbowArrowDebug.svelte'
	import { getArrowInfo } from './getArrowInfo'
	import { reactiveComputed } from './reactiveComputed.svelte'

	let { shape, util }: { shape: TLArrowShape; util: ArrowShapeUtil } = $props()

	const editor = getEditor()

	// Every editor signal the React `component()` read (it ran inside tracked state) is read in here.
	const state = reactiveComputed(
		'arrow shape',
		() => ({ shape, util }),
		({ shape, util }) => {
			const dv = getDisplayValues(util, shape)
			const isSelected = editor.getOnlySelectedShape()?.id === shape.id
			const isEditing = editor.getEditingShapeId() === shape.id

			const info = getArrowInfo(editor, shape)
			if (!info?.isValid) return null

			const labelPosition = getArrowLabelPosition(editor, shape, isEditing)
			return {
				dv,
				isSelected,
				labelBox: labelPosition.box,
				showArrowLabel: isEditing || !isEmptyRichText(shape.props.richText),
				showElbowDebug: shape.props.kind === 'elbow' && debugFlags.debugElbowArrows.get(),
			}
		}
	)

	const s = $derived(state.current)
</script>

{#if s}
	<SVGContainer style="min-width: 50px; min-height: 50px;">
		<ArrowSvg
			{shape}
			strokeColor={s.dv.strokeColor}
			strokeWidth={s.dv.strokeWidth}
			fillColor={s.dv.fillColor}
			patternFillFallbackColor={s.dv.patternFillFallbackColor}
			labelBorderRadius={s.dv.labelBorderRadius}
		/>
		{#if s.showElbowDebug}
			<ElbowArrowDebug arrow={shape} />
		{/if}
	</SVGContainer>
	{#if s.showArrowLabel}
		<RichTextLabel
			shapeId={shape.id}
			type="arrow"
			fontFamily={s.dv.labelFontFamily}
			fontSize={s.dv.labelFontSize}
			lineHeight={s.dv.labelLineHeight}
			textAlign="center"
			verticalAlign="middle"
			labelColor={s.dv.labelColor}
			richText={shape.props.richText}
			textWidth={(s.labelBox.w - s.dv.labelPadding * 2 * shape.props.scale) / shape.props.scale}
			isSelected={s.isSelected}
			padding={0}
			showTextOutline={util.options.showTextOutline}
			style={{
				transform: `translate(${s.labelBox.center.x}px, ${s.labelBox.center.y}px)${shape.props.scale !== 1 ? ` scale(${shape.props.scale})` : ''}`,
			}}
		/>
	{/if}
{/if}
