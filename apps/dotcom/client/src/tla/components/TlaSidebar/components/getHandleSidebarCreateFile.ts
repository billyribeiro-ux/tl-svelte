import { tltime } from 'svelte-draw'
import { routes } from '../../../../routeDefs'
import { navigate } from '../../../../utils/router.svelte'
import { getActiveWorkspaceId } from '../../../hooks/useActiveWorkspaceId.svelte'
import { getApp } from '../../../hooks/useAppState.svelte'
import { getSvelteDrawAppUiEvents } from '../../../utils/app-ui-events'
import { getIsCoarsePointer } from '../../../utils/getIsCoarsePointer'
import { toggleMobileSidebar } from '../../../utils/local-session-state'

/**
 * Was `useHandleSidebarCreateFile()`. Call during component initialisation; the returned function
 * reads the app and the active workspace when it runs.
 */
export function getHandleSidebarCreateFile() {
	const app = getApp()
	const trackEvent = getSvelteDrawAppUiEvents()
	// Create the file in whichever workspace is currently active (the home
	// workspace when in Home, otherwise the selected workspace).
	const activeWorkspaceId = getActiveWorkspaceId()

	let canCreate = true

	return async function handleSidebarCreateFile() {
		if (!canCreate) return
		const workspaceId = activeWorkspaceId.current
		const res = await app.current.createFile({ workspaceId })
		if (res.ok) {
			const { fileId } = res.value
			const isMobile = getIsCoarsePointer()
			if (!isMobile) {
				app.current.sidebarState.update((prev) => ({
					...prev,
					renameState: { fileId, workspaceId },
				}))
			}
			navigate(routes.tlaFile(fileId))
			trackEvent('create-file', { source: 'sidebar' })
			canCreate = false
			tltime.setTimeout('can create again', () => (canCreate = true), 1000)
			if (isMobile) {
				toggleMobileSidebar(false)
			}
		}
	}
}
