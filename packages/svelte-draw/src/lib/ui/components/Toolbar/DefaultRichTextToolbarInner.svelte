<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	import type { TiptapEditor } from '@svelte-draw/editor'
	import type { Snippet } from 'svelte'

	/** @public */
	export interface DefaultRichTextToolbarInnerProps {
		children?: Snippet
		textEditor: TiptapEditor
	}

	const messages = defineMessages({
		toolRichTextToolbarTitle: {
			id: 'tool.rich-text-toolbar-title',
			defaultMessage: 'Text formatting',
		},
	})
</script>

<script lang="ts">
	import { getMarkRange, type Range, type EditorEvents as TextEditorEvents } from '@tiptap/core'
	import type { MarkType } from '@tiptap/pm/model'
	import { Box, debounce } from '@svelte-draw/editor'
	import { getEditor } from '@svelte-draw/svelte'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import { rectToBox } from '../primitives/contextualToolbarUtils'
	import SvelteDrawUiContextualToolbar from '../primitives/SvelteDrawUiContextualToolbar.svelte'
	import DefaultRichTextToolbarContent from './DefaultRichTextToolbarContent.svelte'
	import LinkEditor from './LinkEditor.svelte'

	let { textEditor, children }: DefaultRichTextToolbarInnerProps = $props()

	const editor = getEditor()
	const msg = getTranslation()

	let isEditingLink = $state(false)
	let currentSelection = $state.raw<Range | null>(null)
	let isMousingDown = $state(false)
	let previousSelectionBounds: Box | undefined = undefined

	function onEditLinkStart() {
		isEditingLink = true
	}

	function onEditLinkClose() {
		isEditingLink = false
		const from = textEditor.state.selection.from
		textEditor.commands.setTextSelection({ from, to: from })
	}

	// A new function whenever the selection or link state changes, so the contextual toolbar
	// re-computes its position, as it did when the React callback's identity changed.
	const getSelectionBounds = $derived.by(() => {
		const editingLink = isEditingLink
		const selectionRange = currentSelection
		return () => {
			if (editingLink) {
				// If we're editing a link we don't have selection bounds temporarily.
				return previousSelectionBounds
			}
			// Get the text selection rects as a box. This will be undefined if there are no selections.
			const selection = editor.getContainerWindow().getSelection()

			// If there are no selections, don't return a box
			if (!selectionRange || !selection || selection.rangeCount === 0 || selection.isCollapsed)
				return

			// Get a common box from all of the ranges' screen rects
			const rangeBoxes: Box[] = []
			for (let i = 0; i < selection.rangeCount; i++) {
				const range = selection.getRangeAt(i)
				rangeBoxes.push(rectToBox(range.getBoundingClientRect()))
			}

			const bounds = Box.Common(rangeBoxes)
			previousSelectionBounds = bounds
			return bounds
		}
	})

	// Teardowns run after the `textEditor` prop has already turned null (the parent's `{#if}` is
	// closing), so each effect captures the editor it set up and cleans up that one.
	$effect(() => {
		const te = textEditor
		const handleSelectionUpdate = ({ editor: updated }: TextEditorEvents['selectionUpdate']) => {
			currentSelection = updated.state.selection
		}
		te.on('selectionUpdate', handleSelectionUpdate)
		// Need to kick off the selection update manually to get the initial selection, esp. if select-all.
		handleSelectionUpdate({ editor: te } as TextEditorEvents['selectionUpdate'])
		return () => {
			te.off('selectionUpdate', handleSelectionUpdate)
		}
	})

	// Set up text editor event listeners.
	$effect(() => {
		const te = textEditor
		const handleClick = () => {
			isEditingLink = te.isActive('link')
		}

		te.view.dom.addEventListener('click', handleClick)
		return () => {
			if (te.isInitialized) {
				te.view.dom.removeEventListener('click', handleClick)
			}
		}
	})

	// If we're editing a link, select the entire link.
	// This can happen via a click or via keyboarding over to the link and then
	// clicking the toolbar button.
	$effect(() => {
		void isEditingLink

		// N.B. This specifically isn't checking the isEditingLink state but
		// the current active state of the text editor. This is because there's
		// a subtelty where when going edit-to-edit, that is text editor-to-text editor
		// in different shapes, the isEditingLink state doesn't get reset quickly enough.
		if (textEditor.isActive('link')) {
			try {
				const { from, to } = getMarkRange(
					textEditor.state.doc.resolve(textEditor.state.selection.from),
					textEditor.schema.marks.link as MarkType
				) as Range
				// Select the entire link if we just clicked on it while in edit mode, but not if there's
				// a specific selection.
				if (textEditor.state.selection.empty) {
					textEditor.commands.setTextSelection({ from, to })
				}
			} catch {
				// Sometimes getMarkRange throws an error when the selection is the entire document.
				// This is somewhat mysterious but it's harmless. We just need to ignore it.
				// Also, this seems to have recently broken with the React 19 preparation changes.
			}
		}
	})

	// Set up general event listeners for text selection.
	$effect(() => {
		const te = textEditor
		const handlePointingStateChange = debounce(({ isPointing }: { isPointing: boolean }) => {
			isMousingDown = isPointing
		}, 16)
		const handlePointingDown = () => handlePointingStateChange({ isPointing: true })
		const handlePointingUp = () => handlePointingStateChange({ isPointing: false })

		const touchDownEvents = ['touchstart', 'pointerdown', 'mousedown']
		const touchUpEvents = ['touchend', 'pointerup', 'mouseup']
		touchDownEvents.forEach((eventName: string) => {
			te.view.dom.addEventListener(eventName, handlePointingDown)
		})
		const doc = te.view.dom.ownerDocument
		touchUpEvents.forEach((eventName: string) => {
			doc.body.addEventListener(eventName, handlePointingUp)
		})
		return () => {
			touchDownEvents.forEach((eventName: string) => {
				if (te.isInitialized) {
					te.view.dom.removeEventListener(eventName, handlePointingDown)
				}
			})
			touchUpEvents.forEach((eventName: string) => {
				doc.body.removeEventListener(eventName, handlePointingUp)
			})
		}
	})
</script>

<SvelteDrawUiContextualToolbar
	class="tlui-rich-text__toolbar"
	{getSelectionBounds}
	{isMousingDown}
	changeOnlyWhenYChanges={true}
	label={msg(messages.toolRichTextToolbarTitle)}
>
	{#if children}
		{@render children()}
	{:else if isEditingLink}
		<LinkEditor
			{textEditor}
			value={textEditor.isActive('link') ? textEditor.getAttributes('link').href : ''}
			onClose={onEditLinkClose}
		/>
	{:else}
		<DefaultRichTextToolbarContent {textEditor} {onEditLinkStart} />
	{/if}
</SvelteDrawUiContextualToolbar>
