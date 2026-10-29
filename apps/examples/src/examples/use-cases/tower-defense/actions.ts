import type { Editor } from 'svelte-draw'
import { resetSpawnTimer } from './game-loop'
import { gold$, placingTower$, resetGameState } from './game-state'
import { TOWER_STATS_BY_GEO, type TowerGeo } from './tower-config'

export function pickTower(geo: TowerGeo) {
	// Only arm a tower the player can afford, so the preview only shows when a click would place one
	if (gold$.get() < TOWER_STATS_BY_GEO[geo].cost) return
	placingTower$.set(geo)
}

export function pickSelect(editor: Editor) {
	placingTower$.set(null)
	editor.setCurrentTool('select')
}

export function restartGame(editor: Editor) {
	resetGameState()
	resetSpawnTimer()
	placingTower$.set(null)
	// Towers are locked shapes, so deleting them needs `ignoreShapeLock`
	const allShapeIds = [...editor.getCurrentPageShapeIds()]
	editor.run(() => editor.deleteShapes(allShapeIds), { ignoreShapeLock: true })
}
