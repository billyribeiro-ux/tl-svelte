import { fromDerivedComputed } from './fromDerivedComputed.svelte'
import { params } from '../../utils/router.svelte'
import { getApp } from './useAppState.svelte'

/**
 * The active workspace ("group") is derived from the file that's currently open,
 * not stored separately. We resolve it from the file in the URL and fall back to
 * the user's home workspace, whose default name is "My workspace" and can be renamed.
 *
 * A file can belong to a workspace the user is not a member of (e.g. a guest
 * visiting a shared file); only memberships count as active.
 */
export function getActiveWorkspaceId(): { readonly current: string } {
	const app = getApp()
	// `params` is Svelte state, which a signals computed cannot track, hence the derived dependency.
	return fromDerivedComputed('activeWorkspaceId', () => params.fileSlug, (fileSlug) => {
		if (fileSlug) {
			const file = app.current.getFile(fileSlug)
			if (file?.owningGroupId && app.current.getWorkspaceMembership(file.owningGroupId)) {
				return file.owningGroupId
			}
		}
		return app.current.getHomeWorkspaceId()
	})
}
