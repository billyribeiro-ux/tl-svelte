import {
	type ExtractShapeByProps,
	type TLRichText,
	type TLShapeId,
	isAccelKey,
} from '@svelte-draw/editor'
import { getEditor } from '@svelte-draw/svelte'
import { untrack } from 'svelte'
import { isEmptyRichText } from '../../utils/text/richText'
import { useEditableTextCommon } from './useEditablePlainText.svelte'

/**
 * The reactive inputs of {@link useEditableRichText}. Pass a getter so that prop changes are
 * followed.
 *
 * @public
 */
export interface UseEditableRichTextArgs {
	shapeId: TLShapeId
	type: ExtractShapeByProps<{ richText: TLRichText }>['type']
	richText?: TLRichText
}

/**
 * Call during component initialisation. `args` is a getter so the hook follows prop changes. Bind
 * `rInput` to the rich text area's wrapper element with `bind:ref={editable.rInput}`.
 *
 * @public
 */
export function useEditableRichText(args: () => UseEditableRichTextArgs) {
	const editor = getEditor()
	const common = useEditableTextCommon(() => args().shapeId)
	let rInput = $state.raw<HTMLDivElement | null>(null)

	$effect(() => {
		// The rich text area is only rendered once the label is ready for editing, so it may bind
		// after `isEditing` flips: depend on the bound element too.
		const input = rInput
		if (!common.isEditing || !input) return

		untrack(() => {
			// N.B. In Development mode you need to ensure you're testing this without StrictMode on.
			// Otherwise it's not gonna work as expected on iOS.
			const contentEditable = input.querySelector('[contenteditable]')
			if (contentEditable && editor.getContainerDocument().activeElement !== input) {
				// This is a crucial difference with useEditablePlainText, that we need to select the
				// child contentEditable <div> not rInput directly.
				// Specifically, this is to ensure iOS works. Otherwise, we could just use rInput.
				;(contentEditable as HTMLElement).focus()
			}
		})
	})

	// When the user presses ctrl / meta enter, complete the editing state.
	function handleKeyDown(e: KeyboardEvent) {
		if (editor.getEditingShapeId() !== args().shapeId) return
		if (e.key === 'Enter' && isAccelKey(e)) editor.complete()
	}

	// When the text changes, update the text value.
	function handleChange({ richText }: { richText: TLRichText }) {
		const { shapeId, type } = args()
		if (editor.getEditingShapeId() !== shapeId) return

		editor.updateShape({
			id: shapeId,
			type,
			props: { richText },
		})
	}

	return {
		get rInput() {
			return rInput
		},
		set rInput(value: HTMLDivElement | null) {
			rInput = value
		},
		handleKeyDown,
		handleChange,
		get isEmpty() {
			const richText = args().richText
			return richText && isEmptyRichText(richText)
		},
		get isEditing() {
			return common.isEditing
		},
		get isReadyForEditing() {
			return common.isReadyForEditing
		},
		handleFocus: common.handleFocus,
		handleBlur: common.handleBlur,
		handleInputPointerDown: common.handleInputPointerDown,
		handleDoubleClick: common.handleDoubleClick,
		handlePaste: common.handlePaste,
	}
}
