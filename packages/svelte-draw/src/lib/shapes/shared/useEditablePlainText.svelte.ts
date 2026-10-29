import {
	Editor,
	type ExtractShapeByProps,
	type TLShapeId,
	getPointerInfo,
	preventDefault,
	tlenv,
} from '@svelte-draw/editor'
import { fromComputed, getEditor } from '@svelte-draw/svelte'
import { untrack } from 'svelte'
import { TextHelpers } from './TextHelpers'

/**
 * The reactive inputs of {@link useEditablePlainText}. Pass a getter so that prop changes are
 * followed.
 *
 * @public
 */
export interface UseEditablePlainTextArgs {
	shapeId: TLShapeId
	type: ExtractShapeByProps<{ text: string }>['type']
	text?: string
}

/**
 * Call during component initialisation. `args` is a getter so the hook follows prop changes. Read
 * the state fields (`isEditing`, `isEmpty`, ...) in the template or a `$derived`; bind `rInput` to
 * the textarea with `bind:ref={editable.rInput}` (the textarea is the element focused when editing
 * starts).
 *
 * @public
 */
export function useEditablePlainText(args: () => UseEditablePlainTextArgs) {
	const editor = getEditor()
	const common = useEditableTextCommon(() => args().shapeId)
	let rInput = $state.raw<HTMLTextAreaElement | null>(null)

	$effect(() => {
		const shapeId = args().shapeId
		function selectAllIfEditing(event: { shapeId: TLShapeId }) {
			if (event.shapeId === shapeId) {
				rInput?.select?.()
			}
		}

		editor.on('select-all-text', selectAllIfEditing)
		return () => {
			editor.off('select-all-text', selectAllIfEditing)
		}
	})

	$effect(() => {
		// The textarea is only rendered once the label is ready for editing, so it may bind after
		// `isEditing` flips: depend on the bound element too.
		const input = rInput
		if (!common.isEditing || !input) return

		untrack(() => {
			if (editor.getContainerDocument().activeElement !== input) {
				input.focus()
			}

			if (editor.getInstanceState().isCoarsePointer) {
				input.select()
			}

			// XXX(mime): This fixes iOS not showing the caret sometimes.
			// This "shakes" the caret awake.
			if (tlenv.isSafari) {
				input.blur()
				input.focus()
			}
		})
	})

	// When the user presses ctrl / meta enter, complete the editing state.
	function handleKeyDown(e: KeyboardEvent) {
		if (editor.getEditingShapeId() !== args().shapeId) return

		switch (e.key) {
			case 'Enter': {
				if (e.ctrlKey || e.metaKey) {
					editor.complete()
				}
				break
			}
		}
	}

	// When the text changes, update the text value.
	function handleChange({ plaintext }: { plaintext: string }) {
		const { shapeId, type } = args()
		if (editor.getEditingShapeId() !== shapeId) return

		const normalizedPlaintext = TextHelpers.normalizeText(plaintext || '')
		editor.updateShape({
			id: shapeId,
			type,
			props: { text: normalizedPlaintext },
		})
	}

	return {
		get rInput() {
			return rInput
		},
		set rInput(value: HTMLTextAreaElement | null) {
			rInput = value
		},
		handleKeyDown,
		handleChange,
		get isEmpty() {
			return (args().text || '').trim().length === 0
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

/**
 * Whether the shape is being edited, or is hovered while something else is being edited. Call
 * during component initialisation; read `.current`.
 *
 * @internal
 */
export function useIsReadyForEditing(
	editor: Editor,
	shapeId: TLShapeId | (() => TLShapeId)
): { readonly current: boolean } {
	const signal = $derived.by(() => {
		const id = typeof shapeId === 'function' ? shapeId() : shapeId
		return fromComputed('isReadyForEditing', () => {
			const editingShapeId = editor.getEditingShapeId()
			return (
				// something's being editing... and either it's this shape OR this shape is hovered
				editingShapeId !== null && (editingShapeId === id || editor.getHoveredShapeId() === id)
			)
		})
	})
	return {
		get current() {
			return signal.current
		},
	}
}

/** @internal */
export function useEditableTextCommon(getShapeId: () => TLShapeId) {
	const editor = getEditor()
	const isEditingSignal = $derived.by(() => {
		const shapeId = getShapeId()
		return fromComputed('isEditing', () => editor.getEditingShapeId() === shapeId)
	})
	// A boolean derived, so a re-created `isEditingSignal` (it follows the shape's props) with an
	// unchanged value does not re-run effects that read `isEditing`: re-running the focus effect
	// would steal focus back from the link input.
	const isEditing = $derived(isEditingSignal.current)
	const isReadyForEditing = useIsReadyForEditing(editor, getShapeId)

	function handleInputPointerDown(e: PointerEvent) {
		// N.B. We used to only do this only when isEditing to help
		// prevent an issue where you could drag a selected shape
		// behind another shape. That is addressed now by the CSS logic
		// looking at data-isselectinganything.
		//
		// We still need to follow this logic even if not isEditing
		// because otherwise there is some flakiness in selection.
		// When selecting text, it would sometimes select some text
		// partially if we didn't dispatch/stop below.

		editor.dispatch({
			...getPointerInfo(editor, e),
			type: 'pointer',
			name: 'pointer_down',
			target: 'shape',
			shape: editor.getShape(getShapeId())!,
		})

		e.stopPropagation() // we need to prevent blurring the input
	}

	function handlePaste(e: ClipboardEvent) {
		if (editor.getEditingShapeId() !== getShapeId()) return
		if (e.clipboardData) {
			// find html in the clipboard and look for the svelte-draw data
			const html = e.clipboardData.getData('text/html')
			if (html) {
				if (html.includes('<div data-svelte-draw')) {
					// Paste the plain text data instead of the svelte-draw data
					const plainText = e.clipboardData.getData('text/plain')
					preventDefault(e)
					if (plainText) {
						// eslint-disable-next-line @typescript-eslint/no-deprecated -- best way to insert text with undo support
						editor.getContainerDocument().execCommand('insertText', false, plainText)
					}
				}
			}
		}
	}

	return {
		handleFocus: (): void => {},
		handleBlur: (): void => {},
		handleInputPointerDown,
		handleDoubleClick: editor.markEventAsHandled,
		handlePaste,
		get isEditing() {
			return isEditing
		},
		get isReadyForEditing() {
			return isReadyForEditing.current
		},
	}
}
