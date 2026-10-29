import { fromDerivedComputed } from './fromDerivedComputed.svelte'
import { getMaybeApp } from './useAppState.svelte'

export function getIsFilePinned(
	fileId: () => string,
	workspaceId: () => string
): { readonly current: boolean } {
	const app = getMaybeApp()
	return fromDerivedComputed(
		'isPinned',
		() => ({ file: fileId(), workspace: workspaceId() }),
		({ file, workspace }) => {
			const a = app.current
			return !!(a && file && a.isPinned(file, workspace))
		}
	)
}
