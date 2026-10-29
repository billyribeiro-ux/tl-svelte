<svelte:options namespace="svg" />

<script module lang="ts">
	import type { Box, TLRichText } from '@svelte-draw/editor'

	/** @public */
	export interface RichTextSVGProps {
		bounds: Box
		richText: TLRichText
		fontSize: number
		fontFamily: string
		lineHeight: number
		textAlign: 'start' | 'center' | 'end'
		verticalAlign: 'start' | 'middle' | 'end'
		wrap?: boolean
		labelColor: string
		padding: number
		showTextOutline?: boolean
	}
</script>

<script lang="ts">
	import { resolveLineHeightPx } from '@svelte-draw/editor'
	import { getEditor } from '@svelte-draw/svelte'
	import { renderHtmlFromRichText } from '../../utils/text/richText'
	import { isLegacyAlign } from './legacyProps'
	import { styleToString } from './styleToString'

	/**
	 * Renders a rich text string as SVG given bounds and text properties.
	 *
	 * @public
	 */
	let {
		bounds,
		richText,
		fontSize,
		fontFamily,
		lineHeight,
		textAlign,
		verticalAlign,
		wrap,
		labelColor,
		padding,
		showTextOutline = true,
	}: RichTextSVGProps = $props()

	const editor = getEditor()
	const html = $derived(renderHtmlFromRichText(editor, richText))
	const legacyAlign = $derived(isLegacyAlign(textAlign))
	const justifyContent = $derived(
		textAlign === 'center' || legacyAlign
			? ('center' as const)
			: textAlign === 'start'
				? ('flex-start' as const)
				: ('flex-end' as const)
	)
	const alignItems = $derived(
		verticalAlign === 'middle' ? 'center' : verticalAlign === 'start' ? 'flex-start' : 'flex-end'
	)
	const wrapperStyle = $derived(
		styleToString({
			display: 'flex',
			fontFamily,
			height: `100%`,
			justifyContent,
			alignItems,
			padding: `${padding}px`,
		})
	)
	const style = $derived(
		styleToString({
			fontSize: `${fontSize}px`,
			wrap: wrap ? 'wrap' : 'nowrap',
			color: labelColor,
			lineHeight: `${resolveLineHeightPx(fontSize, lineHeight)}px`,
			// Unitless multiplier consumed by the .tl-rich-text h1–h6 rule (see editor.css).
			'--tl-rich-text-heading-line-height': lineHeight,
			textAlign,
			width: '100%',
			wordWrap: 'break-word',
			overflowWrap: 'break-word',
			whiteSpace: 'pre-wrap',
			textShadow: showTextOutline ? 'var(--tl-text-outline)' : 'none',
			tabSize: 'var(--tl-tab-size, 2)',
		})
	)
</script>

<foreignObject
	x={bounds.minX}
	y={bounds.minY}
	width={bounds.w}
	height={bounds.h}
	class={[
		'tl-export-embed-styles tl-rich-text tl-rich-text-svg',
		showTextOutline ? 'tl-text__outline' : 'tl-text__no-outline',
	]}
>
	<!-- The html is generated from the rich text document by TipTap's schema serializer (renderHtmlFromRichText). -->
	<div style={wrapperStyle}>
		<div {style}>{@html html}</div>
	</div>
</foreignObject>
