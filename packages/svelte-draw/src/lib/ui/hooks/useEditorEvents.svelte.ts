import { getEditor } from '@svelte-draw/svelte'
import { getToasts } from '../context'

/**
 * Listens for editor events that surface as toasts. Call during component initialisation.
 * Replaces `useEditorEvents`.
 *
 * @internal
 */
export function setupEditorEvents() {
	const editor = getEditor()
	const toasts = getToasts()

	$effect(() => {
		function handleMaxShapes({ name, count }: { name: string; pageId: string; count: number }) {
			toasts.addToast({
				title: 'Maximum shapes reached',
				description: `You've reached the maximum number of shapes allowed on ${name} (${count}). Please delete some shapes or move to a different page to continue.`,
				severity: 'warning',
			})
		}

		editor.addListener('max-shapes', handleMaxShapes)
		return () => {
			editor.removeListener('max-shapes', handleMaxShapes)
		}
	})
}
