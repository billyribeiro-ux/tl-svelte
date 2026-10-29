import type { TLRichText, TLShapeId } from '@svelte-draw/editor'

/** @public */
export interface TextAreaProps {
	isEditing: boolean
	text?: string
	shapeId: TLShapeId
	richText?: TLRichText
	handleFocus(): void
	handleBlur(): void
	handleKeyDown(e: KeyboardEvent): void
	handleChange(changeInfo: { plaintext?: string; richText?: TLRichText }): void
	handleInputPointerDown(e: PointerEvent): void
	handleDoubleClick(e: any): any
	handlePaste(e: ClipboardEvent): void
	hasCustomTabBehavior?: boolean
}
