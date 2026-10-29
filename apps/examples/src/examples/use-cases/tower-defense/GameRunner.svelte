<script lang="ts">
	import { getEditor } from 'svelte-draw'
	import { pickSelect, pickTower, restartGame } from './actions'
	import { runGameTick } from './game-loop'
	import { placingTower$ } from './game-state'

	const editor = getEditor()

	$effect(() => {
		const onTick = (elapsedMs: number) => {
			// After a background tab resumes, `tick` reports one large elapsed value that would
			// otherwise teleport every enemy down the path
			const dt = Math.min(60, elapsedMs)
			runGameTick(editor, dt)
		}
		editor.on('tick', onTick)

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.metaKey || e.ctrlKey || e.altKey) return
			const target = e.target as HTMLElement | null
			if (target?.matches('input, textarea, [contenteditable="true"]')) return
			if (e.key === '1') pickTower('triangle')
			else if (e.key === '2') pickTower('rectangle')
			else if (e.key === '3') pickTower('ellipse')
			else if (e.key === 'Escape') pickSelect(editor)
			else if (e.key === ' ') {
				e.preventDefault()
				restartGame(editor)
			}
		}
		window.addEventListener('keydown', onKeyDown)

		return () => {
			editor.off('tick', onTick)
			window.removeEventListener('keydown', onKeyDown)
			placingTower$.set(null)
		}
	})
</script>
