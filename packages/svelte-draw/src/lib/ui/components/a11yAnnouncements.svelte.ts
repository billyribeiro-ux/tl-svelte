import {
	debugFlags,
	defineMessages,
	unsafe__withoutCapture,
	type Editor,
	type TLShapeId,
} from '@svelte-draw/editor'
import { getContainer, quickReactor, tryGetEditor } from '@svelte-draw/svelte'
import { getA11y } from '../context/a11y'
import { getTranslation } from '../hooks/useTranslation/useTranslation.svelte'

const messages = defineMessages({
	a11yMultipleShapes: {
		id: 'a11y.multiple-shapes',
		// Only ever read with two or more shapes, so English shows one form. Still a plural, because
		// other languages distinguish within "many" — see the gate in `internal/scripts/i18n-extract.ts`.
		defaultMessage: '{num, plural, one {# shape selected} other {# shapes selected}}',
	},
	a11yShapeIndex: { id: 'a11y.shape-index', defaultMessage: '{num} of {total}' },
})

/**
 * Core function to generate accessibility announcements for selected shapes
 * @public
 */
export function generateShapeAnnouncementMessage(args: {
	editor: Editor
	selectedShapeIds: TLShapeId[]
	msg(id: string, values?: Record<string, any>): string
}) {
	const { editor, selectedShapeIds, msg } = args
	const numShapes = selectedShapeIds.length

	if (numShapes > 1) {
		return msg(messages.a11yMultipleShapes.id, { num: numShapes })
	}
	if (numShapes !== 1) return ''

	const shapeId = selectedShapeIds[0]
	const shape = editor.getShape(shapeId)
	if (!shape) return ''

	const shapeUtil = editor.getShapeUtil(shape.type)

	// Each shape names itself. Only the convention is left here: a shape that doesn't override
	// `getShapeName` is announced by its tool's label, which is how every built-in but geo, the
	// two media shapes and bookmark gets its name.
	const shapeType = shapeUtil.getShapeName(shape) ?? msg(`tool.${shape.type}`)

	// A selected shape outside the page's reading order (a container's child, or canTabTo
	// false) has no position to announce, and "0 of N" would be wrong
	const readingOrderShapes = editor.getCurrentPageShapesInReadingOrder()
	const indexInReadingOrder = readingOrderShapes.findIndex((s) => s.id === shapeId)
	const shapeIndex =
		indexInReadingOrder === -1
			? ''
			: ' ' +
				msg(messages.a11yShapeIndex.id, {
					num: indexInReadingOrder + 1,
					total: readingOrderShapes.length,
				})

	// Get describing text (alt text or shape text)
	const describingText = shapeUtil.getAriaDescriptor(shape) || shapeUtil.getText(shape) || ''

	// Build the full announcement
	return (describingText ? `${describingText}, ` : '') + `${shapeType}.${shapeIndex}`
}

/**
 * Announces the selection to screen readers while the select tool is idle. Replaces
 * `useSelectedShapesAnnouncer`; call during component initialisation, inside the editor and a11y
 * contexts.
 *
 * @public
 */
export function setupSelectedShapesAnnouncer() {
	const editor = tryGetEditor()
	const a11y = getA11y()
	const msg = getTranslation()

	let prevSelectedShapeIds: string[] = []

	$effect(() => {
		if (!editor) return undefined
		return quickReactor('announce selection', () => {
			const isInSelecting = editor.isIn('select.idle')
			if (isInSelecting) {
				const selectedShapeIds = editor.getSelectedShapeIds()
				if (selectedShapeIds !== prevSelectedShapeIds) {
					prevSelectedShapeIds = selectedShapeIds
					unsafe__withoutCapture(() => {
						const a11yLive = generateShapeAnnouncementMessage({
							editor,
							selectedShapeIds,
							msg,
						})

						if (a11yLive) {
							a11y.announce({ msg: a11yLive })
						}
					})
				}
			}
		})
	})
}

/**
 * Logs announcements and tab focus changes to the console when the `a11y` debug flag is on.
 * Replaces `useA11yDebug`; `getMsg` follows the current announcement.
 *
 * @internal
 */
export function setupA11yDebug(getMsg: () => string | undefined) {
	const container = getContainer()

	$effect(() => {
		const msg = getMsg()
		if (debugFlags.a11y.get()) {
			const log = (msg: string) => {
				// eslint-disable-next-line no-console
				console.debug(
					`%ca11y%c: ${msg}`,
					`color: white; background: #40C057; padding: 2px;border-radius: 3px;`,
					'font-weight: normal'
				)
			}
			const doc = container.ownerDocument
			const handleKeyUp = (e: KeyboardEvent) => {
				const el = doc.activeElement
				if (e.key === 'Tab' && el && el !== doc.body && !el.classList.contains('tl-container')) {
					const label = el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent
					if (label) {
						log(label)
					}
				}
			}

			if (msg) {
				log(msg)
			}

			doc.addEventListener('keyup', handleKeyUp)
			return () => doc.removeEventListener('keyup', handleKeyUp)
		}
		return undefined
	})
}
