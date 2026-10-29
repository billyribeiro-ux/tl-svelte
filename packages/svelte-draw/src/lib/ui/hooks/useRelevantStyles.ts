import {
	DefaultColorStyle,
	DefaultDashStyle,
	DefaultFillStyle,
	DefaultSizeStyle,
	SharedStyleMap,
	type ReadonlySharedStyleMap,
	type StyleProp,
} from '@svelte-draw/editor'
import { fromComputed, getEditor, type SignalValue } from '@svelte-draw/svelte'

const selectToolStyles: readonly StyleProp<any>[] = Object.freeze([
	DefaultColorStyle,
	DefaultDashStyle,
	DefaultFillStyle,
	DefaultSizeStyle,
])

/**
 * The styles relevant to the current tool/selection, or `null` when none apply. Call during
 * component initialisation. Replaces `useRelevantStyles`.
 *
 * @public
 */
export function createRelevantStyles(
	stylesToCheck: readonly StyleProp<any>[] = selectToolStyles
): SignalValue<ReadonlySharedStyleMap | null> {
	const editor = getEditor()
	return fromComputed('getRelevantStyles', () => {
		const styles = new SharedStyleMap(editor.getSharedStyles())
		const isInShapeSpecificTool = !!editor.root.getCurrent()?.shapeType
		const isInSelect = editor.isIn('select')
		const hasShapesSelected = isInSelect && editor.getSelectedShapeIds().length > 0

		if (styles.size === 0 && isInSelect && !hasShapesSelected) {
			for (const style of stylesToCheck) {
				styles.applyValue(style, editor.getStyleForNextShape(style))
			}
		}

		if (isInShapeSpecificTool || hasShapesSelected || styles.size > 0) {
			// If size is 0 we may still want to return an empty styles map to allow
			// the opacity slider to show up.
			// This can happen in two situations:
			// 1. When the user is in the select tool and has multiple shapes selected but they have no supported styles (beyond opacity).
			// 2. When the user is in a shape-specific tool and the shape has no supported styles (beyond opacity obvs).
			return styles
		}

		return null
	})
}
