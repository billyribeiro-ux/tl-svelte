<script lang="ts">
	import { fromComputed } from 'svelte-draw'
	import { untrack } from 'svelte'
	import { getSvelteDrawAppUiEvents } from '../../utils/app-ui-events'
	import { getApp } from '../../hooks/useAppState.svelte'
	import WorkspaceSettingsDialogContent from './WorkspaceSettingsDialogContent.svelte'

	let { workspaceId, onClose }: { workspaceId: string; onClose(): void } = $props()

	const app = getApp()
	const trackEvent = getSvelteDrawAppUiEvents()
	// Read once: the dialog is opened for one workspace.
	const id = untrack(() => workspaceId)

	const workspaceMembership = fromComputed('workspaceMembership', () =>
		app.current.getWorkspaceMembership(id)
	)

	// The name input live-saves on each keystroke, but we only want one `rename-workspace`
	// analytics event per edit session. Capture the name on open and compare it against the
	// latest name when the dialog unmounts.
	const workspaceName = $derived(workspaceMembership.current?.group?.name ?? null)
	const initialWorkspaceName = untrack(() => workspaceName)
	let latestWorkspaceName = untrack(() => workspaceName)
	$effect(() => {
		if (workspaceName !== null) latestWorkspaceName = workspaceName
	})
	$effect(() => {
		return () => {
			if (
				initialWorkspaceName !== null &&
				latestWorkspaceName !== null &&
				latestWorkspaceName !== initialWorkspaceName
			) {
				trackEvent('rename-workspace', { source: 'workspace-settings' })
			}
		}
	})
</script>

{#if workspaceMembership.current}
	{@const membership = workspaceMembership.current}
	{#if membership.group}
		<WorkspaceSettingsDialogContent
			workspaceId={id}
			{onClose}
			workspaceMembership={membership}
			workspace={membership.group}
		/>
	{/if}
{/if}
