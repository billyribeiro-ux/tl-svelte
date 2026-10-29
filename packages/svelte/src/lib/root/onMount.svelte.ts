import type { Editor } from '@svelte-draw/editor'
import { untrack } from 'svelte'
import type { TLOnMountHandler } from './types'

/**
 * Runs `getOnMount()`'s handler once for `editor` when the calling component mounts, and tears it
 * down when the component is destroyed. Replaces the `useOnMount` hook. Call during component
 * initialisation. The handler is read untracked, so swapping it does not re-run the mount.
 *
 * @internal
 */
export function setupOnMount(editor: Editor, getOnMount: () => TLOnMountHandler | undefined) {
	$effect(() => {
		const onMount = untrack(getOnMount)
		let teardown: (() => void) | void = undefined
		// If the user wants to do something when the editor mounts, we make sure it doesn't effect the history.
		// todo: is this reeeeally what we want to do, or should we leave it up to the caller?
		// Untracked: the user's handler may read `$state` (a React effect tracks nothing), and a
		// tracked read would re-run the whole mount, and so re-run the handler, whenever it changes.
		untrack(() =>
			editor.run(
				() => {
					teardown = onMount?.(editor)
					editor.emit('mount')
				},
				{ history: 'ignore' }
			)
		)
		window.svelteDrawReady = true
		return () => {
			teardown?.()
			// The editor's component can unmount without the editor being disposed (for example when
			// the canvas is swapped for an error fallback), so emit `unmount` here rather than relying
			// on disposal. If the editor is being disposed, `dispose()` emits `unmount` itself, so we
			// only emit here when it's still mounted and alive.
			if (editor.getIsMounted() && !editor.isDisposed) {
				editor.run(() => editor.emit('unmount'), { history: 'ignore' })
			}
		}
	})
}
