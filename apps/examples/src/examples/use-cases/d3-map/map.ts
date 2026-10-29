import type { Editor } from 'svelte-draw'
import { MAP_HEIGHT, MAP_WIDTH } from './us-map-data'

export function createMap(editor: Editor) {
	editor.createShape({
		type: 'us-map',
		x: 0,
		y: 0,
		props: { w: MAP_WIDTH, h: MAP_HEIGHT },
	})
}

export function resetMap(editor: Editor) {
	const mapAndStateIds = [...editor.getCurrentPageShapeIds()].filter((id) => {
		const shape = editor.getShape(id)
		return shape?.type === 'us-map' || shape?.type === 'us-state'
	})
	editor.run(() => {
		editor.deleteShapes(mapAndStateIds)
		createMap(editor)
	})
	editor.zoomToFit({ animation: { duration: 200 } })
}
