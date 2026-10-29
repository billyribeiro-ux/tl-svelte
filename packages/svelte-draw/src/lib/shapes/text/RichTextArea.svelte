<script lang="ts">
	import { isEqual, preventDefault, type Editor, type TLRichText, type TLShapeId } from '@svelte-draw/editor'
	import { createUniqueSafeId, fromComputed, getEditor } from '@svelte-draw/svelte'
	import {
		Editor as TextEditor,
		type EditorEvents,
		type JSONContent,
		type Editor as TTEditor,
	} from '@tiptap/core'
	import type { EditorView } from '@tiptap/pm/view'
	import { untrack } from 'svelte'
	import { isEditingRichTextList } from '../../utils/text/richText'
	import { nativeEvents } from '../shared/nativeEvents'
	import type { TextAreaProps } from './TextAreaProps'

	/**
	 * N.B. In Development mode you need to ensure you're testing this without StrictMode on.
	 * Otherwise it's not gonna work as expected on iOS.
	 * Specifically, it means that the virtual keyboard won't pop open sometimes
	 * (iOS starts flipping out when you render multiple times when trying to focus something) .
	 */

	/**
	 * A rich text area that can be used for editing text with rich text formatting.
	 * This component uses the TipTap editor under the hood (driven imperatively through
	 * `@tiptap/core`). Bind `ref` to get the wrapper element.
	 *
	 * @public
	 */
	let {
		ref = $bindable(null),
		shapeId,
		isEditing,
		richText,
		handleFocus,
		handleChange,
		handleBlur,
		handleKeyDown,
		handleDoubleClick,
		hasCustomTabBehavior,
		handlePaste,
	}: TextAreaProps & { ref?: HTMLDivElement | null } = $props()

	const editor = getEditor()
	const tipTapId = createUniqueSafeId('tip-tap-editor')
	const tipTapConfig = fromComputed('tipTapConfig', () => editor.getTextOptions().tipTapConfig)

	// svelte-ignore state_referenced_locally
	let rInitialRichText = richText
	let rTextEditor: TTEditor | null = null

	// Declared before the effect that creates the text editor: effects run in declaration order, so
	// an initial-content change is recorded before the editor is (re)created, like the React
	// layout effects.
	$effect(() => {
		const current = richText
		untrack(() => {
			if (!rTextEditor) {
				rInitialRichText = current
			} else if (!isEqual(rInitialRichText, current)) {
				rTextEditor.commands.setContent(current as JSONContent)
			}
		})
	})

	// The order of events is:
	// - editor begins editing any shape
	// - we set listeners for select all / place caret events
	// - if the user is editing this shape, this component is rendered
	// - editor emits the select all event / place caret event
	// - the text editor is onCreate callback is called
	const rCreateInfo = {
		selectAll: false,
		caretPosition: null as { x: number; y: number } | null,
	}

	$effect(() => {
		// The listeners are re-registered whenever editing starts or stops (the React deps were
		// [editor, isEditing]).
		void isEditing

		function selectAllIfEditing(event: { shapeId: TLShapeId }) {
			if (event.shapeId === editor.getEditingShapeId()) {
				rCreateInfo.selectAll = true
			}
		}

		function placeCaret(event: { shapeId: TLShapeId; point: { x: number; y: number } }) {
			if (event.shapeId === editor.getEditingShapeId()) {
				rCreateInfo.caretPosition = event.point
			}
		}

		editor.on('select-all-text', selectAllIfEditing)
		editor.on('place-caret', placeCaret)
		return () => {
			editor.off('select-all-text', selectAllIfEditing)
			editor.off('place-caret', placeCaret)
		}
	})

	// Creates the TipTap editor for the host element and returns its teardown. This is an attachment,
	// not an effect, and it reads everything untracked: the editor must live exactly as long as the
	// host element (which only exists while editing with a config, see the `{#if}` below). The React
	// version re-created it only when [isEditing, config, shape, tab behaviour] changed; here those
	// are fixed for the element's lifetime, and the handlers are read through the props at event time
	// (`useEvent`), so they always see the latest ones. Re-creating it on any other invalidation
	// would reset the caret to the start of the text on every keystroke.
	function mountTextEditor(element: HTMLDivElement) {
		const config = untrack(() => tipTapConfig.current)
		const currentShapeId = untrack(() => shapeId)
		if (!config) return

		return untrack(() => {
			const { editorProps, ...restOfTipTapConfig } = config

			const textEditorInstance = new TextEditor({
				element,
				autofocus: true,
				editable: true,
				onUpdate: (props: EditorEvents['update']) => {
					const content: TLRichText = props.editor.state.doc.toJSON()
					rInitialRichText = content
					handleChange({ richText: content })
				},
				onFocus: () => handleFocus(),
				onBlur: () => handleBlur(),
				// onCreate is called after a `setTimeout(0)`
				onCreate: (props) => {
					// If we're not still editing the original shape, then don't do anything.
					if (editor.getEditingShapeId() !== currentShapeId) return

					const textEditor = props.editor
					editor.setRichTextEditor(textEditor)

					const { selectAll, caretPosition } = rCreateInfo

					if (selectAll) {
						// Select all of the text
						textEditor.chain().focus().selectAll().run()
					} else if (caretPosition) {
						// Set the initial caret screen position
						const pos = textEditor.view.posAtCoords({
							left: caretPosition.x,
							top: caretPosition.y,
						})?.pos

						if (pos) {
							// Focus to that position.
							textEditor.chain().focus().setTextSelection(pos).run()
						} else {
							// If no position, default to select all.
							textEditor.chain().focus().selectAll().run()
						}
					}
				},
				editorProps: {
					handleKeyDown: (view: EditorView, event: KeyboardEvent) => {
						if (!hasCustomTabBehavior && event.key === 'Tab') {
							handleTab(editor, view, event)
						}

						handleKeyDown(event)
					},
					handlePaste: (view: EditorView, event: ClipboardEvent) => {
						handlePaste(event)
						if (event.defaultPrevented) return true
						return false
					},
					handleDoubleClick: (_view, _pos, event) => handleDoubleClick(event),
					...editorProps,
				},
				coreExtensionOptions: {
					clipboardTextSerializer: {
						blockSeparator: '\n',
					},
				},
				// N.B. We disable the text direction in the core list here,
				// but we add it back in again in our own extensions list so that
				// people can omit/override it if they want to.
				enableCoreExtensions: { textDirection: false },
				textDirection: 'auto',
				...restOfTipTapConfig,
				content: rInitialRichText as JSONContent,
			})

			// XXX: When creating a brand new shape and double-clicking into it quickly to edit it,
			// there's some kind of race condition happening where the editor doesn't focus properly.
			const timeout = editor.timers.setTimeout(() => {
				if (rCreateInfo.caretPosition || rCreateInfo.selectAll) {
					textEditorInstance.commands.focus()
				} else if (textEditorInstance.state.selection.empty) {
					// A range selection means something (e.g. a click on the blurred label selecting
					// all the text) already placed it within these 100ms. Collapsing it to the end here
					// would undo that.
					textEditorInstance.commands.focus('end')
				}

				rCreateInfo.selectAll = false
				rCreateInfo.caretPosition = null
			}, 100)

			rTextEditor = textEditorInstance

			return () => {
				rTextEditor = null
				clearTimeout(timeout)
				textEditorInstance.destroy()
			}
		})
	}

	// Prevent exiting the editor when hitting Tab.
	// Also, insert a tab character at the front of the line if the shift key isn't pressed,
	// otherwise if shift is pressed, remove a tab character from the front of the line.
	function handleTab(editor: Editor, view: EditorView, event: KeyboardEvent) {
		// Don't exit the editor.
		event.preventDefault()

		if (isEditingRichTextList(editor)) return

		const { state, dispatch } = view
		// (`$`-prefixed names are reserved in Svelte, so these are renamed)
		const { $from: selectionFrom, $to: selectionTo } = state.selection
		const isShift = event.shiftKey

		// Create a new transaction
		let tr = state.tr

		// Iterate over each line in the selection in reverse so that the positions
		// are stable as we modify the document.
		let pos = selectionTo.end()
		while (pos >= selectionFrom.start()) {
			const line = state.doc.resolve(pos).blockRange()
			if (!line) break

			const lineStart = line.start
			const lineEnd = line.end
			const lineText = state.doc.textBetween(lineStart, lineEnd, '\n')

			// Check if the current line or any of its parent nodes are part of a list
			let isInList = false
			state.doc.nodesBetween(lineStart, lineEnd, (node) => {
				if (
					node.type.name === 'bulletList' ||
					node.type.name === 'orderedList' ||
					node.type.name === 'taskList'
				) {
					isInList = true
					return false // Stop iteration
				}
				return true
			})

			// TODO: for now skip over lists. Later, we might consider handling them using
			// sinkListItem and liftListItem from @tiptap/pm/schema-list
			if (!isInList) {
				if (!isShift) {
					// Insert a tab character at the start of the line
					tr = tr.insertText('\t', lineStart + 1)
				} else {
					// Remove a tab character from the start of the line
					if (lineText.startsWith('\t')) {
						tr = tr.delete(lineStart + 1, lineStart + 2)
					}
				}
			}

			pos = lineStart - 1
		}

		const mappedSelection = state.selection.map(tr.doc, tr.mapping)
		tr.setSelection(mappedSelection)

		if (tr.docChanged) {
			dispatch(tr)
		}
	}
</script>

{#if isEditing && tipTapConfig.current}
	<!--
		These are native listeners (see nativeEvents) so that they run before the editor container's
		own listeners, like React's synthetic handlers did.
	-->
	<div
		id={tipTapId}
		bind:this={ref}
		tabindex="-1"
		data-testid="rich-text-area"
		class="tl-rich-text tl-text tl-text-input"
		{@attach nativeEvents<HTMLDivElement>({
			contextmenu: (e) => {
				if (isEditing) e.stopPropagation()
			},
			// This touchend is important for Android to be able to change selection on text.
			touchend: (e) => e.stopPropagation(),
			// On FF, there's a behavior where dragging a selection will grab that selection into
			// the drag event. However, once the drag is over, and you select away from the textarea,
			// starting a drag over the textarea will restart a selection drag instead of a shape drag.
			// This prevents that default behavior in FF.
			dragstart: (e) => preventDefault(e),
		})}
		{@attach nativeEvents<HTMLDivElement>(
			{
				// N.B. When PointerStateExtension was introduced, this was moved there.
				// However, that caused selecting over list items to break.
				// The handleDOMEvents in TipTap don't seem to support the pointerDownCapture event.
				pointerdown: (e) => e.stopPropagation(),
			},
			{ capture: true }
		)}
	>
		<div class="tl-rich-text" {@attach mountTextEditor}></div>
	</div>
{/if}
