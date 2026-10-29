import { tlenvReactive } from '@svelte-draw/editor'
import { react, unsafe__withoutCapture } from '@svelte-draw/state'
import { getEditor } from '../context/editor'

/**
 * Keeps the instance state's `isCoarsePointer` in sync with `tlenvReactive`. Call during component
 * initialisation (it uses `$effect`). Replaces `useCoarsePointer`.
 *
 * @internal
 */
export function useCoarsePointer() {
	const editor = getEditor()

	// When the coarse pointer state changes, update the instance state
	$effect(() =>
		react('coarse pointer change', () => {
			const isCoarsePointer = tlenvReactive.get().isCoarsePointer
			const isInstanceStateCoarsePointer = unsafe__withoutCapture(
				() => editor.getInstanceState().isCoarsePointer
			)
			if (isCoarsePointer === isInstanceStateCoarsePointer) return
			editor.updateInstanceState({ isCoarsePointer: isCoarsePointer })
		})
	)
}
