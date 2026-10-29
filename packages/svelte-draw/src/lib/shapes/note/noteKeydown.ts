import { Vec, type Editor, type TLNoteShape, type TLShapeId } from '@svelte-draw/editor'
import { isEditingRichTextList, renderPlaintextFromRichText } from '../../utils/text/richText'
import { isRightToLeftLanguage } from '../../utils/text/text'
import { getDisplayValues } from '../shared/getDisplayValues'
import { getNoteShapeForAdjacentPosition, startEditingAdjacentNote } from './noteHelpers'
import type { NoteShapeUtil } from './NoteShapeUtil'

/**
 * Creates the keydown handler for a note's label: Tab and Cmd/Ctrl+Enter create (and start editing)
 * an adjacent note. `getDir` reads the translation direction when the key is pressed (the
 * translation context may be absent, in which case it falls back to ltr).
 */
export function createNoteKeydownHandler(
	editor: Editor,
	id: TLShapeId,
	getDir: () => 'ltr' | 'rtl'
) {
	return (e: KeyboardEvent) => {
		const shape = editor.getShape<TLNoteShape>(id)
		if (!shape) return

		const isTab = e.key === 'Tab'
		const isCmdEnter = (e.metaKey || e.ctrlKey) && e.key === 'Enter'

		if (isTab && isEditingRichTextList(editor)) {
			// In a list, let the rich text editor indent the item instead of
			// creating a new note. Prevent default so Tab doesn't move focus out
			// of the editor when the item can't be indented (e.g. the first item).
			e.preventDefault()
			return
		}

		if (isTab || isCmdEnter) {
			e.preventDefault()

			const pageTransform = editor.getShapePageTransform(id)
			const pageRotation = pageTransform.rotation()

			// Based on the inputs, calculate the offset to the next note
			// tab controls x axis (shift inverts direction set by RTL)
			// cmd enter is the y axis (shift inverts direction)
			const isRTL = !!(
				getDir() === 'rtl' ||
				// todo: can we check a partial of the text, so that we don't have to render the whole thing?
				isRightToLeftLanguage(renderPlaintextFromRichText(editor, shape.props.richText))
			)

			const noteUtil = editor.getShapeUtil(shape) as NoteShapeUtil
			const dv = getDisplayValues(noteUtil, shape)

			const noteOffset = isTab
				? dv.noteWidth + editor.options.adjacentShapeMargin
				: dv.noteHeight +
					editor.options.adjacentShapeMargin +
					// If we're growing down, we need to account for the current shape's growY
					(isCmdEnter && !e.shiftKey ? shape.props.growY : 0)
			const offsetLength = noteOffset * shape.props.scale

			const adjacentCenter = new Vec(
				isTab ? (e.shiftKey != isRTL ? -1 : 1) : 0,
				isCmdEnter ? (e.shiftKey ? -1 : 1) : 0
			)
				.mul(offsetLength)
				.add(new Vec(dv.noteWidth / 2, dv.noteHeight / 2).mul(shape.props.scale))
				.rot(pageRotation)
				.add(pageTransform.point())

			const newNote = getNoteShapeForAdjacentPosition(editor, {
				shape,
				center: adjacentCenter,
				pageRotation,
				noteWidth: dv.noteWidth,
				noteHeight: dv.noteHeight,
			})

			if (newNote) {
				startEditingAdjacentNote(editor, newNote)
			}
		}
	}
}
