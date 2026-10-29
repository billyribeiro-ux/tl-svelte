<script lang="ts">
	import {
		F,
		fromComputed,
		SvelteDrawUiButton,
		SvelteDrawUiButtonLabel,
		SvelteDrawUiDialogBody,
		SvelteDrawUiDialogCloseButton,
		SvelteDrawUiDialogFooter,
		SvelteDrawUiDialogHeader,
		SvelteDrawUiDialogTitle,
	} from 'svelte-draw'
	import { routes } from '../../../routeDefs'
	import { getAuth } from '../../../utils/clerk.svelte'
	import { navigate } from '../../../utils/router.svelte'
	import { getApp } from '../../hooks/useAppState.svelte'
	import { getHasFileAdminRights } from '../../hooks/useIsFileOwner.svelte'
	import { getSvelteDrawAppUiEvents } from '../../utils/app-ui-events'

	let {
		fileId,
		workspaceId,
		onClose,
	}: {
		fileId: string
		workspaceId: string
		onClose(): void
	} = $props()

	const app = getApp()
	const trackEvent = getSvelteDrawAppUiEvents()
	const auth = getAuth()

	const isOwner = getHasFileAdminRights(() => fileId)
	const fileName = fromComputed('file name', () => app.current.getFileName(fileId))

	async function handleDelete() {
		const token = await auth.current.getToken()
		if (!token) throw new Error('No token')
		const currentApp = app.current
		const deleted = await currentApp.deleteOrForgetFile(fileId, workspaceId)
		if (!deleted) {
			onClose()
			return
		}
		trackEvent('delete-file', { source: 'file-menu' })

		// Stay in the workspace the file was deleted from: go to its most recent remaining
		// file, or — if that was its last file — create a fresh blank file in it, the same
		// "always land on a file" behavior as opening an empty workspace. (Home lists its files
		// via getMyFiles rather than as a workspace.)
		const isHome = workspaceId === currentApp.getHomeWorkspaceId()
		const remaining = isHome
			? currentApp.getMyFiles()
			: currentApp.getWorkspaceFilesSorted(workspaceId)
		if (remaining.length > 0) {
			navigate(routes.tlaFile(remaining[0].fileId))
		} else {
			const result = await currentApp.createFile({ workspaceId })
			if (result.ok) {
				navigate(routes.tlaFile(result.value.fileId))
			}
		}
		onClose()
	}
</script>

{#snippet strong(chunks: string)}<strong>{chunks}</strong>{/snippet}

<SvelteDrawUiDialogHeader>
	<SvelteDrawUiDialogTitle>
		{#if isOwner.current}<F defaultMessage="Delete file" />{:else}<F defaultMessage="Forget file" />{/if}
	</SvelteDrawUiDialogTitle>
	<SvelteDrawUiDialogCloseButton />
</SvelteDrawUiDialogHeader>
<SvelteDrawUiDialogBody style="max-width: 350px">
	{#if isOwner.current}
		<F
			defaultMessage={"Are you sure you want to delete <strong>{fileName}</strong>?"}
			values={{ fileName: fileName.current }}
			tags={{ strong }}
		/>
	{:else}
		<F
			defaultMessage={"Are you sure you want to forget <strong>{fileName}</strong>?"}
			values={{ fileName: fileName.current }}
			tags={{ strong }}
		/>
	{/if}
</SvelteDrawUiDialogBody>
<SvelteDrawUiDialogFooter class="tlui-dialog__footer__actions">
	<SvelteDrawUiButton type="normal" onclick={onClose}>
		<SvelteDrawUiButtonLabel>
			<F defaultMessage="Cancel" />
		</SvelteDrawUiButtonLabel>
	</SvelteDrawUiButton>
	<SvelteDrawUiButton type="danger" onclick={handleDelete}>
		<SvelteDrawUiButtonLabel>
			{#if isOwner.current}<F defaultMessage="Delete" />{:else}<F defaultMessage="Forget" />{/if}
		</SvelteDrawUiButtonLabel>
	</SvelteDrawUiButton>
</SvelteDrawUiDialogFooter>
