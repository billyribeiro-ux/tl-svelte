<script module lang="ts">
	import type { Box, ExtractShapeByProps, TLRichText, TLShapeId } from '@svelte-draw/editor'
	import type { CssStyleObject } from './styleToString'

	/** @public */
	export interface RichTextLabelProps {
		shapeId: TLShapeId
		type: ExtractShapeByProps<{ richText: TLRichText }>['type']
		fontFamily: string
		fontSize: number
		lineHeight: number
		textAlign: 'start' | 'center' | 'end'
		verticalAlign: 'start' | 'middle' | 'end'
		wrap?: boolean
		richText?: TLRichText
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
		hasCustomTabBehavior?: boolean
		showTextOutline?: boolean
	}
</script>

<script lang="ts">
	import {
		openWindow,
		preventDefault,
		resolveLineHeightPx,
		type TLEventInfo,
	} from '@svelte-draw/editor'
	import { fromComputed, getEditor, quickReactor } from '@svelte-draw/svelte'
	import { renderHtmlFromRichText } from '../../utils/text/richText'
	import RichTextArea from '../text/RichTextArea.svelte'
	import { isLegacyAlign } from './legacyProps'
	import { nativeEvents } from './nativeEvents'
	import { styleToString } from './styleToString'
	import { useEditableRichText } from './useEditableRichText.svelte'

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
		richText,
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
		hasCustomTabBehavior,
		showTextOutline = true,
	}: RichTextLabelProps = $props()

	const editor = getEditor()
	let isDragging = false
	const legacyAlign = $derived(isLegacyAlign(textAlign))
	const editable = useEditableRichText(() => ({ shapeId, type, richText }))

	const html = $derived(richText ? renderHtmlFromRichText(editor, richText) : undefined)

	const selectToolActive = fromComputed(
		'isSelectToolActive',
		() => editor.getCurrentToolId() === 'select'
	)

	$effect(() =>
		quickReactor('isDragging', () => {
			editor.getInstanceState()
			isDragging = editor.inputs.getIsDragging()
		})
	)

	function handlePointerDown(e: PointerEvent) {
		const HTMLElementCtor = editor.getContainerWindow().HTMLElement
		if (
			e.target instanceof HTMLElementCtor &&
			(e.target.tagName === 'A' || e.target.closest('a'))
		) {
			// This mousedown prevent default is to let dragging when over a link work.
			preventDefault(e)

			if (!selectToolActive.current) return
			const link = e.target.closest('a')?.getAttribute('href') ?? ''
			// We don't get the mouseup event later because we preventDefault
			// so we have to do it manually.
			const handlePointerUp = (e: TLEventInfo) => {
				if (e.name !== 'pointer_up' || !link) return

				if (!isDragging) {
					openWindow(link, '_blank', false)
				}
				editor.off('event', handlePointerUp)
			}
			editor.on('event', handlePointerUp)
		}
	}

	// TODO: probably combine tl-text and tl-arrow eventually
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
			// Unitless multiplier consumed by the .tl-rich-text h1–h6 rule (see editor.css).
			'--tl-rich-text-heading-line-height': lineHeight,
			minWidth: Math.ceil(textWidth || 0),
			color: labelColor,
			width: textWidth ? Math.ceil(textWidth) : undefined,
			height: textHeight ? Math.ceil(textHeight) : undefined,
		})
	)
</script>

<!-- Should be guarded higher up so that this doesn't render... but repeated here. This should never be true. -->
{#if editable.isEditing || !editable.isEmpty}
	<div
		class={[
			`${cssPrefix}-label tl-text-wrapper tl-rich-text-wrapper`,
			showTextOutline ? 'tl-text__outline' : 'tl-text__no-outline',
		]}
		aria-hidden={!editable.isEditing}
		data-hastext={!editable.isEmpty}
		data-isediting={editable.isEditing}
		data-textwrap={!!wrap}
		data-isselected={isSelected}
		style={wrapperStyle}
	>
		<div class="{cssPrefix}-label__inner tl-text-content__wrapper" style={innerStyle}>
			<div class="{cssPrefix} tl-text tl-text-content" dir="auto">
				{#if richText}
					<!-- todo: see if I can abuse this -->
					<!-- The html is generated from the rich text document by TipTap's schema serializer (renderHtmlFromRichText), as `dangerouslySetInnerHTML` was before. -->
					<div
						class="tl-rich-text"
						data-is-select-tool-active={selectToolActive.current}
						{@attach nativeEvents({ pointerdown: handlePointerDown })}
						data-is-ready-for-editing={editable.isReadyForEditing}
					>
						{@html html || ''}
					</div>
				{/if}
			</div>
			{#if editable.isReadyForEditing || isSelected}
				<RichTextArea
					bind:ref={editable.rInput}
					{richText}
					isEditing={editable.isEditing}
					{shapeId}
					handleFocus={editable.handleFocus}
					handleBlur={editable.handleBlur}
					handleChange={editable.handleChange}
					handleInputPointerDown={editable.handleInputPointerDown}
					handleDoubleClick={editable.handleDoubleClick}
					handlePaste={editable.handlePaste}
					{hasCustomTabBehavior}
					handleKeyDown={handleKeyDownCustom ?? editable.handleKeyDown}
				/>
			{/if}
		</div>
	</div>
{/if}
