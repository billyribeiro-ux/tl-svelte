import { EffectScheduler } from '@svelte-draw/state'
import { debounce } from '@svelte-draw/utils'
import { getContainer, getEditor } from '../context/editor'

/**
 * Writes the editor's efficient zoom level to the container's `--tl-zoom` CSS variable. Call during
 * component initialisation (it uses `$effect`). Replaces `useZoomCss`.
 */
export function useZoomCss() {
	const editor = getEditor()
	const container = getContainer()

	$effect(() => {
		const setScale = (s: number) => container.style.setProperty('--tl-zoom', s.toString())
		const setScaleDebounced = debounce(setScale, 100)

		const scheduler = new EffectScheduler('useZoomCss', () =>
			setScale(editor.getEfficientZoomLevel())
		)

		scheduler.attach()
		scheduler.execute()

		return () => {
			scheduler.detach()
			setScaleDebounced.cancel()
		}
	})
}
