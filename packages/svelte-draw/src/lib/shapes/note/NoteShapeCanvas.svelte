<script lang="ts">
	import type { TLNoteShape, TLShapeId } from '@svelte-draw/editor'
	import { getEditor } from '@svelte-draw/svelte'
	import { getDirection } from '../../ui/hooks/useTranslation/useTranslation.svelte'
	import HyperlinkButton from '../shared/HyperlinkButton.svelte'
	import RichTextLabel from '../shared/RichTextLabel.svelte'
	import type { TLNoteShapeAttributionComponent } from './DefaultNoteShapeAttribution.svelte'
	import { createNoteKeydownHandler } from './noteKeydown'

	/** The canvas rendering of a note shape: the paper, its attribution badge, its label and its link. */
	let {
		shape,
		width,
		height,
		backgroundColor,
		borderBottom,
		boxShadow,
		attribution,
		AttributionComponent,
		showLabel,
		isSelected,
		fontFamily,
		fontSize,
		lineHeight,
		textAlign,
		verticalAlign,
		labelColor,
		padding,
		noteWidth,
		noteHeight,
	}: {
		shape: TLNoteShape
		width: number
		height: number
		backgroundColor: string
		borderBottom: string
		boxShadow: string
		attribution: { short: string; full: string } | null
		AttributionComponent: TLNoteShapeAttributionComponent
		showLabel: boolean
		isSelected: boolean
		fontFamily: string
		fontSize: number
		lineHeight: number
		textAlign: 'start' | 'center' | 'end'
		verticalAlign: 'start' | 'middle' | 'end'
		labelColor: string
		padding: number
		noteWidth: number
		noteHeight: number
	} = $props()

	const editor = getEditor()
	const direction = getDirection()

	const id: TLShapeId = $derived(shape.id)
	const scale = $derived(shape.props.scale)
	// Falls back to ltr when there is no translation context.
	const handleKeyDown = $derived(createNoteKeydownHandler(editor, id, () => direction.current))
	const labelStyle = $derived(
		scale !== 1
			? {
					transform: `scale(${scale})`,
					transformOrigin: 'top left',
					width: noteWidth,
					height: noteHeight + shape.props.growY,
				}
			: undefined
	)
</script>

<div
	{id}
	class="tl-note__container"
	style:width="{width}px"
	style:height="{height}px"
	style:background-color={backgroundColor}
	style:border-bottom={borderBottom}
	style:box-shadow={boxShadow}
>
	{#if attribution && AttributionComponent}
		<AttributionComponent
			{shape}
			name={attribution.full}
			firstName={attribution.short}
			color={labelColor}
			{scale}
			variant="canvas"
		/>
	{/if}
	{#if showLabel}
		<RichTextLabel
			shapeId={id}
			type={shape.type}
			{fontFamily}
			{fontSize}
			{lineHeight}
			textAlign={textAlign}
			{verticalAlign}
			richText={shape.props.richText}
			{isSelected}
			{labelColor}
			wrap
			{padding}
			hasCustomTabBehavior
			showTextOutline={false}
			onKeyDown={handleKeyDown}
			style={labelStyle}
		/>
	{/if}
</div>
{#if 'url' in shape.props && shape.props.url}
	<HyperlinkButton url={shape.props.url} />
{/if}
