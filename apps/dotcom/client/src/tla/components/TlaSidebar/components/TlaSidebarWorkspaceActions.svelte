<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		newFile: { defaultMessage: 'New file' },
		workspaceSettings: { defaultMessage: 'Manage' },
	})
</script>

<script lang="ts">
	import { getDialogs, getTranslation } from 'svelte-draw'
	import { getSvelteDrawAppUiEvents } from '../../../utils/app-ui-events'
	import { withDialogProps } from '../../../../utils/withDialogProps'
	import WorkspaceSettingsDialog from '../../dialogs/WorkspaceSettingsDialog.svelte'
	import { getHandleSidebarCreateFile } from './getHandleSidebarCreateFile'
	import TlaSidebarActionButton from './TlaSidebarActionButton.svelte'
	import TlaSidebarSearch from './TlaSidebarSearch.svelte'
	import styles from '../sidebar.module.css'

	/**
	 * The action rows shown below the workspace switcher. Both the home space and
	 * non-home workspaces get the search, new-board, and settings actions. (The home
	 * workspace's settings are limited: it can be renamed but not shared or managed -
	 * see WorkspaceSettingsDialog.)
	 */
	let { workspaceId }: { workspaceId: string } = $props()

	const msg = getTranslation()
	const { addDialog } = getDialogs()
	const trackEvent = getSvelteDrawAppUiEvents()
	const handleCreateFile = getHandleSidebarCreateFile()

	function handleSettings() {
		addDialog({
			component: withDialogProps(WorkspaceSettingsDialog, { workspaceId }),
		})
		trackEvent('open-share-menu', { source: 'sidebar' })
	}
</script>

<div class={styles.sidebarSection}>
	<TlaSidebarSearch />
	<TlaSidebarActionButton
		icon="edit"
		label={msg(messages.newFile)}
		onClick={handleCreateFile}
		testId="tla-sidebar-new-board"
	/>
	<TlaSidebarActionButton
		icon="settings"
		label={msg(messages.workspaceSettings)}
		onClick={handleSettings}
		testId="tla-sidebar-workspace-settings"
	/>
</div>
