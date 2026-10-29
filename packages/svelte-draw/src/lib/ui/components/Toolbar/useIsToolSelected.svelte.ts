import { GeoShapeGeoStyle } from '@svelte-draw/editor'
import { fromComputed, getEditor, type SignalValue } from '@svelte-draw/svelte'
import type { TLUiToolItem } from '../../hooks/useTools.svelte'

/**
 * Whether `getTool()` is the editor's active tool. Call during component initialisation. Replaces
 * `useIsToolSelected`; `getTool` is a getter so it follows a changing tool.
 *
 * @public
 */
export function createIsToolSelected(
	getTool: () => TLUiToolItem | undefined
): SignalValue<boolean> {
	const editor = getEditor()
	const activeToolId = fromComputed('current tool id', () => editor.getCurrentToolId())
	// Only read for tools that mask themselves as `geo`, so other items never subscribe to it.
	const currentGeo = fromComputed(
		'current geo style',
		() =>
			editor.getSharedStyles().getAsKnownValue(GeoShapeGeoStyle) ??
			editor.getStyleForNextShape(GeoShapeGeoStyle)
	)

	const isSelected = $derived.by(() => {
		const tool = getTool()
		if (!tool) return false
		const geo = tool.meta?.geo
		if (geo) {
			// A tool masking itself as `geo` (the zoom tool does) has no shape type of its own,
			// so its shared styles come back empty
			return activeToolId.current === 'geo' && geo === currentGeo.current
		}
		return activeToolId.current === tool.id
	})

	return {
		get current() {
			return isSelected
		},
	}
}
