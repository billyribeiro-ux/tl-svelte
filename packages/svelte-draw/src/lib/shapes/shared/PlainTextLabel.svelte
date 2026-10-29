<script module lang="ts">
	import type { Box, ExtractShapeByProps, TLShapeId } from '@svelte-draw/editor'
	import type { CssStyleObject } from './styleToString'

	/** @public */
	export interface PlainTextLabelProps {
		shapeId: TLShapeId
		type: ExtractShapeByProps<{ text: string }>['type']
		fontFamily: string
		fontSize: number
		lineHeight: number
		textAlign: 'start' | 'center' | 'end'
		verticalAlign: 'start' | 'middle' | 'end'
		wrap?: boolean
		text?: string
		labelColor: string
		bounds?: Box
		isSelected: boolean
		onKeyDown?(e: KeyboardEvent): void
		classNamePrefix?: string
		/** Extra inline styles, applied after (and overriding) the label's own. */
		style?: CssStyleObject | string
		textWidth?: number
		textHeight?: number
		padding?: number
		showTextOutline?: boolean
	}
</script>

<script lang="ts">
	import { resolveLineHeightPx } from '@svelte-draw/editor'
	import PlainTextArea from '../text/PlainTextArea.svelte'
	import { isLegacyAlign } from './legacyProps'
	import { styleToString } from './styleToString'
	import { TextHelpers } from './TextHelpers'
	import { useEditablePlainText } from './useEditablePlainText.svelte'

	/**
	 * Renders a text label that can be used inside of shapes.
	 * The component has the ability to be edited in place and furthermore
	 * supports rich text editing.
	 *
	 * @public
	 */
	let {
		shapeId,
		type,
		text: plaintext,
		labelColor,
		fontFamily,
		fontSize,
		lineHeight,
		textAlign,
		verticalAlign,
		wrap,
		isSelected,
		padding = 0,
		onKeyDown: handleKeyDownCustom,
		classNamePrefix,
		style,
		textWidth,
		textHeight,
		showTextOutline = true,
	}: PlainTextLabelProps = $props()

	const editable = useEditablePlainText(() => ({ shapeId, type, text: plaintext }))

	const finalPlainText = $derived(TextHelpers.normalizeTextForDom(plaintext || ''))
	const hasText = $derived(finalPlainText.length > 0)
	const legacyAlign = $derived(isLegacyAlign(textAlign))

	// TODO: probably combine tl-text and tl-arrow eventually
	// In case you're grepping for this, it breaks down as follows:
	// tl-text-label, tl-text-label__inner, tl-text-shape-label, tl-text
	// tl-arrow-label, tl-arrow-label__inner, tl-arrow
	const cssPrefix = $derived(classNamePrefix || 'tl-text')

	const lineHeightPx = $derived(resolveLineHeightPx(fontSize, lineHeight))

	const wrapperStyle = $derived(
		styleToString({
			fontFamily,
			textAlign,
			justifyContent:
				textAlign === 'center' || legacyAlign
					? 'center'
					: textAlign === 'end'
						? 'flex-end'
						: 'flex-start',
			alignItems:
				verticalAlign === 'middle' ? 'center' : verticalAlign === 'end' ? 'flex-end' : 'flex-start',
			padding,
		}) +
			' ' +
			styleToString(style)
	)

	const innerStyle = $derived(
		styleToString({
			fontSize,
			lineHeight: `${lineHeightPx}px`,
			minHeight: `${lineHeightPx}px`,
			minWidth: Math.ceil(textWidth || 0),
			color: labelColor,
			width: textWidth ? Math.ceil(textWidth) : undefined,
			height: textHeight ? Math.ceil(textHeight) : undefined,
		})
	)
</script>

{#if editable.isEditing || hasText}
	<div
		class="{cssPrefix}-label tl-text-wrapper tl-plain-text-wrapper"
		aria-hidden={!editable.isEditing}
		data-hastext={!editable.isEmpty}
		data-isediting={editable.isEditing}
		data-is-ready-for-editing={editable.isReadyForEditing}
		data-textwrap={!!wrap}
		data-isselected={isSelected}
		style={wrapperStyle}
	>
		<div class="{cssPrefix}-label__inner tl-text-content__wrapper" style={innerStyle}>
			<div
				class={[
					`${cssPrefix} tl-text tl-text-content`,
					showTextOutline ? 'tl-text__outline' : 'tl-text__no-outline',
				]}
				dir="auto"
			>
				{#each finalPlainText.split('\n') as lineOfText, index (index)}
					<div dir="auto">{lineOfText}</div>
				{/each}
			</div>
			{#if editable.isReadyForEditing || isSelected}
				<PlainTextArea
					bind:ref={editable.rInput}
					text={plaintext}
					isEditing={editable.isEditing}
					{shapeId}
					handleFocus={editable.handleFocus}
					handleBlur={editable.handleBlur}
					handleChange={editable.handleChange}
					handleInputPointerDown={editable.handleInputPointerDown}
					handleDoubleClick={editable.handleDoubleClick}
					handlePaste={editable.handlePaste}
					handleKeyDown={handleKeyDownCustom ?? editable.handleKeyDown}
				/>
			{/if}
		</div>
	</div>
{/if}
