<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		myWorkspace: { defaultMessage: 'My workspace' },
		createWorkspace: { defaultMessage: 'New workspace' },
	})
</script>

<script lang="ts">
	import { DropdownMenu } from 'bits-ui'
	import {
		fromComputed,
		getContainer,
		getDialogs,
		getTranslation,
		uniqueId,
		useGlobalMenuIsOpen,
	} from 'svelte-draw'
	import { routes } from '../../../../routeDefs'
	import { globalEditor } from '../../../../utils/globalEditor'
	import { navigate } from '../../../../utils/router.svelte'
	import { withDialogProps } from '../../../../utils/withDialogProps'
	import { getActiveWorkspaceId } from '../../../hooks/useActiveWorkspaceId.svelte'
	import { getApp } from '../../../hooks/useAppState.svelte'
	import { getSvelteDrawAppUiEvents } from '../../../utils/app-ui-events'
	import { getIsCoarsePointer } from '../../../utils/getIsCoarsePointer'
	import CreateWorkspaceDialog from '../../dialogs/CreateWorkspaceDialog.svelte'
	import { TLA_MENU_POSITION } from '../../tla-menu/tla-menu-position'
	import TlaIcon from '../../TlaIcon/TlaIcon.svelte'
	import { fromDerivedComputed } from '../../../hooks/fromDerivedComputed.svelte'
	import styles from '../sidebar.module.css'

	/**
	 * The fixed top region of the sidebar: a dropdown for switching between the
	 * home workspace and the user's other workspaces, followed by action rows for
	 * the active workspace. Selecting a workspace opens the file the user most
	 * recently had open in it (or its top file if they've visited none), which makes
	 * it active (the active workspace is derived from the open file).
	 */
	const msg = getTranslation()
	const app = getApp()
	const { addDialog } = getDialogs()
	const container = getContainer()
	const trackEvent = getSvelteDrawAppUiEvents()
	const activeWorkspaceIdHolder = getActiveWorkspaceId()
	const activeWorkspaceId = $derived(activeWorkspaceIdHolder.current)
	const homeWorkspaceId = fromComputed('homeWorkspaceId', () => app.current.getHomeWorkspaceId())
	const isHome = $derived(activeWorkspaceId === homeWorkspaceId.current)
	const myWorkspaceLbl = $derived(msg(messages.myWorkspace))

	const workspaces = fromComputed('workspaceMemberships', () => {
		const homeId = app.current.getHomeWorkspaceId()
		return app.current
			.getWorkspaceMemberships()
			.filter(
				(g): g is typeof g & { group: NonNullable<(typeof g)['group']> } =>
					g.groupId !== homeId && !!g.group
			)
	})
	const activeWorkspaceName = fromDerivedComputed(
		'active workspace name',
		() => activeWorkspaceId,
		(id) => app.current.getWorkspaceMembership(id)?.group?.name
	)
	const homeWorkspaceName = fromComputed(
		'home workspace name',
		() => app.current.getWorkspaceMembership(app.current.getHomeWorkspaceId())?.group?.name
	)

	// Use a stable, editor-independent menu id. useMenuIsOpen would suffix the id
	// with the active file editor's contextId, but the sidebar receives that editor
	// via globalEditor and it is replaced on every file/workspace switch. That made
	// the switcher's open state churn with - and get cleared by the dispose of - the
	// outgoing editor, so reopening it mid-switch auto-dismissed once the new canvas loaded.
	// We still complete any in-progress canvas interaction on open (the one useful side
	// effect useMenuIsOpen gave us) by running it against the current editor, without
	// scoping the menu state itself to that editor.
	const menu = useGlobalMenuIsOpen('sidebar-workspace-switcher', (nextIsOpen) => {
		if (nextIsOpen) globalEditor.get()?.complete()
	})

	async function switchToWorkspace(workspaceId: string) {
		// Open the file the user last had open here, not just the top of the pinned-first list.
		const mostRecentFileId = app.current.getMostRecentFileId(workspaceId)
		if (mostRecentFileId) {
			navigate(routes.tlaFile(mostRecentFileId))
			return
		}
		// A workspace created moments ago may still be seeding its welcome file: the
		// createWorkspace mutation lands before the file does, so it briefly appears empty.
		// Await that in-flight seed and open its result rather than racing it with a duplicate
		// blank file. (On seed failure we fall through to the blank-file path below.)
		const pendingWelcome = app.current.getPendingWorkspaceWelcomeFile(workspaceId)
		if (pendingWelcome) {
			const seeded = await pendingWelcome
			if (seeded.ok) {
				navigate(routes.tlaFile(seeded.value.fileId))
				return
			}
		}
		// Empty workspace: create a blank file and open it, so selecting a workspace always
		// lands you on a file within it. The welcome file is seeded only when a workspace is
		// first created (see handleCreateWorkspace), so an emptied workspace - like the
		// home workspace - just gets a fresh blank file to rename, not another welcome doc.
		const res = await app.current.createFile({ workspaceId })
		if (res.ok) {
			if (!getIsCoarsePointer()) {
				app.current.sidebarState.update((prev) => ({
					...prev,
					renameState: { fileId: res.value.fileId, workspaceId },
				}))
			}
			navigate(routes.tlaFile(res.value.fileId))
		}
	}

	function handleCreateWorkspace() {
		addDialog({
			component: withDialogProps(CreateWorkspaceDialog, {
				onCreate: async (name: string) => {
					const id = uniqueId()
					const createRes = await app.current.z.mutate.createWorkspace({ id, name }).client
					if (createRes.type === 'error') {
						app.current.showMutationRejectionToast(createRes.error)
						return
					}
					trackEvent('create-workspace', { source: 'sidebar' })
					// Seed the workspace's welcome file once, here at creation, and open it
					// directly (not via switchToWorkspace, whose empty-workspace path would
					// otherwise create a blank file before the welcome file lands).
					const res = await app.current.createWorkspaceWelcomeFile(id)
					if (res.ok) {
						navigate(routes.tlaFile(res.value.fileId))
					} else {
						// Seeding failed; still land the user in the new workspace rather than
						// leaving them stranded. switchToWorkspace creates a blank file for the
						// (now empty) workspace and opens it.
						await switchToWorkspace(id)
					}
				},
			}),
		})
	}
</script>

{#snippet switcherItem(
	isActive: boolean,
	onSelect: () => void,
	label: string,
	testId?: string
)}
	<DropdownMenu.Item
		class={[styles.sidebarWorkspaceSwitcherItem, 'tla-text_ui__regular', 'notranslate']}
		data-active={isActive}
		data-element="workspace-link"
		{onSelect}
		data-testid={testId}
	>
		<span class={styles.sidebarWorkspaceSwitcherItemLabel}>
			<TlaIcon icon={isActive ? 'check' : 'none'} />
			<span class={styles.sidebarTruncatedText}>{label}</span>
		</span>
	</DropdownMenu.Item>
{/snippet}

<div class={styles.sidebarSection}>
	<div class={styles.sidebarWorkspaceSwitcherRoot}>
		<DropdownMenu.Root
			bind:open={() => menu.isOpen, (value) => menu.onOpenChange(value)}
		>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<button
						{...props}
						class={[
							styles.sidebarWorkspaceSwitcherTrigger,
							styles.hoverable,
							'tla-text_ui__regular',
						]}
						data-testid="tla-workspace-switcher"
					>
						<span
							class={[styles.sidebarWorkspaceSwitcherLabel, 'notranslate']}
							data-testid="tla-active-workspace-name"
						>
							{activeWorkspaceName.current ?? myWorkspaceLbl}
						</span>
						<TlaIcon icon="chevron-up-down" class={styles.sidebarWorkspaceSwitcherChevrons} />
					</button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Portal to={container}>
				<DropdownMenu.Content
					class={['tlui-menu', styles.sidebarWorkspaceSwitcherMenu]}
					side="bottom"
					align="start"
					{...TLA_MENU_POSITION}
					onCloseAutoFocus={(e) => {
						// When the switcher closes because another menu is opening (e.g. a file's
						// "…" menu), don't restore focus to our trigger - that focus shift would
						// dismiss the just-opened menu, making it flash. A plain Escape/outside
						// close (no other menu open) still restores focus for keyboard users.
						if (globalEditor.get()?.menus.hasAnyOpenMenus()) e.preventDefault()
					}}
				>
					{@render switcherItem(
						isHome,
						() => switchToWorkspace(homeWorkspaceId.current),
						homeWorkspaceName.current ?? myWorkspaceLbl,
						'tla-workspace-switcher-home'
					)}
					{#each workspaces.current as g (g.group.id)}
						{@render switcherItem(
							g.group.id === activeWorkspaceId,
							() => switchToWorkspace(g.group.id),
							g.group.name
						)}
					{/each}
					<DropdownMenu.Separator class={styles.sidebarWorkspaceSwitcherSeparator} />
					<DropdownMenu.Item
						class={[
							styles.sidebarWorkspaceSwitcherItem,
							styles.sidebarWorkspaceSwitcherItemCreate,
							'tla-text_ui__regular',
						]}
						onSelect={handleCreateWorkspace}
						data-testid="tla-create-workspace-menu-item"
					>
						<span class={styles.sidebarWorkspaceSwitcherItemLabel}>
							<TlaIcon icon="plus" />
							<span class={styles.sidebarTruncatedText}>{msg(messages.createWorkspace)}</span>
						</span>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	</div>
</div>
