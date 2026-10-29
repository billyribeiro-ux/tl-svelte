<script lang="ts" module>
	import { FILE_PREFIX, type TlaFile } from '@svelte-draw/dotcom-shared'
	import { defineMessages, getIncrementedName } from 'svelte-draw'
	import type { SvelteDrawApp } from '../../app/SvelteDrawApp'

	const messages = defineMessages({
		copied: { defaultMessage: 'Copied link' },
		copyLink: { defaultMessage: 'Copy link' },
		delete: { defaultMessage: 'Delete' },
		duplicate: { defaultMessage: 'Duplicate' },
		forget: { defaultMessage: 'Forget' },
		rename: { defaultMessage: 'Rename' },
		copy: { defaultMessage: 'Copy' },
		pin: { defaultMessage: 'Pin file' },
		unpin: { defaultMessage: 'Unpin file' },
		myWorkspace: { defaultMessage: 'My workspace' },
	})

	function getDuplicateName(file: TlaFile, app: SvelteDrawApp) {
		if (file.name.trim().length === 0) {
			return ''
		}
		const currentFileName = app.getFileName(file.id)
		const allFileNames = app.getUserOwnFiles().map((file) => file.name)
		return getIncrementedName(currentFileName, allFileNames)
	}
</script>

<script lang="ts">
	import {
		fromComputed,
		getDialogs,
		getToasts,
		getTranslation,
		SvelteDrawUiMenuCheckboxItem,
		SvelteDrawUiMenuGroup,
		SvelteDrawUiMenuItem,
		SvelteDrawUiMenuSubmenu,
		tryGetEditor,
		uniqueId,
	} from 'svelte-draw'
	import { routes } from '../../../routeDefs'
	import { navigate } from '../../../utils/router.svelte'
	import { withDialogProps } from '../../../utils/withDialogProps'
	import { getActiveWorkspaceId } from '../../hooks/useActiveWorkspaceId.svelte'
	import { getApp } from '../../hooks/useAppState.svelte'
	import { getSvelteDrawAppUiEvents, type TLAppUiEventSource } from '../../utils/app-ui-events'
	import { copyTextToClipboard } from '../../utils/copy'
	import CreateWorkspaceDialog from '../dialogs/CreateWorkspaceDialog.svelte'
	import TlaDeleteFileDialog from '../dialogs/TlaDeleteFileDialog.svelte'
	import { editorMessages } from '../TlaEditor/editor-messages'
	import { downloadAppFile } from '../TlaEditor/useFileEditorOverrides.svelte'
	import { fromDerivedComputed } from '../../hooks/fromDerivedComputed.svelte'

	let {
		source,
		fileId,
		onRenameAction,
		workspaceId,
	}: {
		source: TLAppUiEventSource
		fileId: string
		onRenameAction(): void
		workspaceId: string | null
	} = $props()

	const msg = getTranslation()
	const app = getApp()
	const editor = tryGetEditor()
	const { addDialog } = getDialogs()
	const { addToast } = getToasts()
	const trackEvent = getSvelteDrawAppUiEvents()
	const activeWorkspaceId = getActiveWorkspaceId()

	const hasAdminRights = fromDerivedComputed(
		'hasFileAdminRights',
		() => fileId,
		(id) => app.current.canUpdateFile(id)
	)
	const isPinned = fromDerivedComputed(
		'isPinned',
		() => ({ fileId, workspaceId }),
		({ fileId: id, workspaceId: ws }) => !!(id && app.current.isPinned(id, ws ?? ''))
	)
	const file = fromDerivedComputed(
		'file',
		() => fileId,
		(id) => app.current.getFile(id)
	)
	const homeWorkspaceId = fromComputed('homeWorkspaceId', () => app.current.getHomeWorkspaceId())

	// Get all workspace memberships (including the home workspace, filtered out below)
	const workspaceMemberships = fromComputed('workspaceMemberships', () =>
		app.current.getWorkspaceMemberships()
	)

	// A file lives in exactly one workspace. The "Move to" menu is a checklist of every
	// destination - the home workspace plus each non-home workspace - with the file's own
	// workspace checked. The home workspace is rendered separately (it's always the first item),
	// labelled with its own name like any other workspace.
	// (This is the workspace the file belongs to, which is not necessarily one the current user
	// can write to - for that, see activeWorkspaceId above.)
	const fileWorkspaceId = $derived(file.current?.owningGroupId ?? homeWorkspaceId.current)
	const homeWorkspaceName = $derived(
		workspaceMemberships.current.find((g) => g.groupId === homeWorkspaceId.current)?.group?.name
	)
	const moveToWorkspaces = $derived(
		workspaceMemberships.current.filter(
			(g): g is typeof g & { group: NonNullable<(typeof g)['group']> } =>
				g.groupId !== homeWorkspaceId.current && !!g.group
		)
	)

	function handleCopyLinkClick() {
		const url = routes.tlaFile(fileId, { asUrl: true })
		// The mounted editor is the open file's, which a sidebar row may not be.
		const deepLink = source === 'file-header' ? editor?.createDeepLink({ url }).toString() : null
		copyTextToClipboard(deepLink ?? url)
		addToast({
			id: 'copied-link',
			title: msg(messages.copied),
		})
		trackEvent('copy-file-link', { source })
	}

	async function handlePinUnpinClick() {
		if (!workspaceId) return
		if (app.current.isPinned(fileId, workspaceId)) {
			app.current.z.mutate.unpinFile({ fileId, workspaceId })
		} else {
			app.current.z.mutate.pinFile({ fileId, workspaceId })
		}
	}

	async function handleDuplicateClick() {
		// The sidebar passes the workspace the file is listed under; the file header doesn't, so
		// fall back to the user's active workspace. This matches the sidebar (and unlike the file's
		// own owning workspace, it's always one the user can write to — e.g. a guest duplicating a
		// shared file gets the copy in their home workspace, not the owner's).
		const targetWorkspaceId = workspaceId ?? activeWorkspaceId.current
		if (!targetWorkspaceId) return
		const newFileId = uniqueId()
		const file = app.current.getFile(fileId)
		if (!file) return
		trackEvent('duplicate-file', { source })
		const res = await app.current.createFile({
			fileId: newFileId,
			workspaceId: targetWorkspaceId,
			name: getDuplicateName(file, app.current),
			createSource: `${FILE_PREFIX}/${fileId}`,
		})
		// copy the state too
		const prevState = app.current.getFileState(fileId)
		app.current.updateFileState(newFileId, {
			lastSessionState: prevState?.lastSessionState,
		})
		if (res.ok) {
			app.current.sidebarState.update((prev) => ({
				...prev,
				renameState: { fileId: newFileId, workspaceId: targetWorkspaceId },
			}))
			navigate(routes.tlaFile(newFileId))
		}
	}

	function handleDeleteClick() {
		if (!workspaceId) return
		addDialog({
			component: withDialogProps(TlaDeleteFileDialog, { workspaceId, fileId }),
		})
	}

	function handleDownloadClick() {
		trackEvent('download-file', { source })
		downloadAppFile(fileId)
	}

	function handleCreateNewWorkspace() {
		addDialog({
			component: withDialogProps(CreateWorkspaceDialog, {
				onCreate: async (name: string) => {
					const id = uniqueId()
					const createRes = await app.current.z.mutate.createWorkspace({ id, name }).client
					if (createRes.type === 'error') {
						app.current.showMutationRejectionToast(createRes.error)
						return
					}
					trackEvent('create-workspace', { source })
					const moveRes = await app.current.z.mutate.moveFileToWorkspace({
						fileId,
						workspaceId: id,
					}).client
					if (moveRes.type === 'error') {
						// the workspace was created; only the move failed
						app.current.showMutationRejectionToast(moveRes.error)
					}
				},
			}),
		})
	}
</script>

<SvelteDrawUiMenuGroup id="file-actions">
	<!-- todo: in published rooms, support copying link -->
	<SvelteDrawUiMenuItem
		label={msg(messages.copyLink)}
		id="copy-link"
		readonlyOk
		onSelect={handleCopyLinkClick}
	/>
	{#if hasAdminRights.current}
		<SvelteDrawUiMenuItem
			label={msg(messages.rename)}
			id="rename"
			readonlyOk
			onSelect={onRenameAction}
		/>
	{/if}
	<!-- todo: in published rooms, support duplication / forking -->
	<SvelteDrawUiMenuItem
		label={msg(messages.duplicate)}
		id="duplicate"
		readonlyOk
		onSelect={handleDuplicateClick}
	/>
	<SvelteDrawUiMenuItem
		label={msg(editorMessages.downloadFile)}
		id="download-file"
		readonlyOk
		onSelect={handleDownloadClick}
	/>
	{#if workspaceId}
		<SvelteDrawUiMenuItem
			label={isPinned.current ? msg(messages.unpin) : msg(messages.pin)}
			id="pin-unpin"
			readonlyOk
			onSelect={handlePinUnpinClick}
		/>
	{/if}
</SvelteDrawUiMenuGroup>
<SvelteDrawUiMenuGroup id="file-delete">
	{#if hasAdminRights.current}
		<SvelteDrawUiMenuSubmenu id="move-to-workspace" label="Move to" size="small">
			<SvelteDrawUiMenuGroup id="workspaces">
				<SvelteDrawUiMenuCheckboxItem
					label={homeWorkspaceName ?? msg(messages.myWorkspace)}
					id="my-files"
					readonlyOk
					checked={fileWorkspaceId === homeWorkspaceId.current}
					onSelect={() => {
						if (fileWorkspaceId === homeWorkspaceId.current) return
						app.current.z.mutate.moveFileToWorkspace({
							fileId,
							workspaceId: homeWorkspaceId.current,
						})
					}}
				/>
				{#each moveToWorkspaces as membership (membership.groupId)}
					<SvelteDrawUiMenuCheckboxItem
						label={membership.group.name}
						id={`workspace-${membership.groupId}`}
						readonlyOk
						checked={membership.groupId === fileWorkspaceId}
						onSelect={() => {
							if (membership.groupId === fileWorkspaceId) return
							app.current.z.mutate.moveFileToWorkspace({ fileId, workspaceId: membership.groupId })
						}}
					/>
				{/each}
			</SvelteDrawUiMenuGroup>
			<SvelteDrawUiMenuGroup id="create-new-workspace">
				<SvelteDrawUiMenuItem
					label="New workspace"
					id="create-new-workspace"
					iconLeft="plus"
					readonlyOk
					onSelect={handleCreateNewWorkspace}
				/>
			</SvelteDrawUiMenuGroup>
		</SvelteDrawUiMenuSubmenu>
	{/if}
	{#if workspaceId}
		<SvelteDrawUiMenuItem
			label={msg(hasAdminRights.current ? messages.delete : messages.forget)}
			id="delete"
			readonlyOk
			onSelect={handleDeleteClick}
		/>
	{/if}
</SvelteDrawUiMenuGroup>
