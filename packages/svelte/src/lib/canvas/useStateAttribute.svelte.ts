import { react } from '@svelte-draw/state'
import { getEditor } from '../context/editor'

/**
 * Mirrors the editor's state path and coarse-pointer flag onto the container as `data-state` and
 * `data-coarse`. Call during component initialisation (it uses `$effect.pre`). Replaces
 * `useStateAttribute`.
 */
export function useStateAttribute() {
	const editor = getEditor()

	// we use a pre-effect (the layout effect of old) because we don't want there to be any
	// perceptible delay between the editor mounting and this attribute being applied, because
	// styles may depend on it:
	$effect.pre(() =>
		react('stateAttribute', () => {
			const container = editor.getContainer()
			const instanceState = editor.getInstanceState()
			container.setAttribute('data-state', editor.getPath())
			container.setAttribute('data-coarse', String(instanceState.isCoarsePointer))
		})
	)
}
