<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		cancel: { defaultMessage: 'Cancel' },
		copyInviteLink: { defaultMessage: 'Copy invite link' },
		deleteWorkspace: { defaultMessage: 'Delete workspace' },
		inviteTeammates: { defaultMessage: 'Invite teammates' },
		leave: { defaultMessage: 'Leave' },
		leaveWorkspace: { defaultMessage: 'Leave workspace' },
		member: { defaultMessage: 'Member' },
		mustKeepOwner: {
			defaultMessage: 'A workspace must keep at least one owner. Make someone else an owner first.',
		},
		namePlaceholder: { defaultMessage: 'Workspace name' },
		owner: { defaultMessage: 'Owner' },
		regenerateInviteLink: { defaultMessage: 'Regenerate invite link' },
		remove: { defaultMessage: 'Remove' },
		removeDescription: {
			defaultMessage: 'Are you sure you want to remove {name} from this workspace?',
		},
		you: { defaultMessage: 'you' },
	})
</script>

<script lang="ts">
	import { can, MAX_WORKSPACE_NAME_LENGTH, type Role } from '@svelte-draw/dotcom-shared'
	import { Tooltip } from 'bits-ui'
	import { untrack } from 'svelte'
	import {
		F,
		fromComputed,
		getDialogs,
		getTranslation,
		SvelteDrawUiDialogBody,
		SvelteDrawUiDialogCloseButton,
		SvelteDrawUiDialogHeader,
		SvelteDrawUiDialogTitle,
		SvelteDrawUiInput,
		SvelteDrawUiTooltip,
	} from 'svelte-draw'
	import type { SvelteDrawApp } from '../../app/SvelteDrawApp'
	import { getApp } from '../../hooks/useAppState.svelte'
	import { getCurrentFileId } from '../../hooks/useCurrentFileId.svelte'
	import { navigate } from '../../../utils/router.svelte'
	import { getSvelteDrawAppUiEvents } from '../../utils/app-ui-events'
	import TlaButton from '../TlaButton/TlaButton.svelte'
	import {
		TlaMenuControl,
		TlaMenuControlLabel,
		TlaMenuSelect,
		TlaMenuSwitch,
		TlaMenuTabsPage,
		TlaMenuTabsRoot,
		TlaMenuTabsTab,
		TlaMenuTabsTabs,
	} from '../tla-menu/tla-menu.svelte'
	import ConfirmDialog from './ConfirmDialog.svelte'
	import styles from './dialogs.module.css'
	import { withDialogProps } from '../../../utils/withDialogProps'

	type WorkspaceMembership = NonNullable<ReturnType<SvelteDrawApp['getWorkspaceMembership']>>

	let {
		workspaceId,
		onClose,
		workspaceMembership,
		workspace,
	}: {
		workspaceId: string
		onClose(): void
		workspaceMembership: WorkspaceMembership
		workspace: NonNullable<WorkspaceMembership['group']>
	} = $props()

	const msg = getTranslation()
	const app = getApp()
	const { addDialog } = getDialogs()
	const trackEvent = getSvelteDrawAppUiEvents()
	const currentFileId = getCurrentFileId()

	let activeTab = $state('members')
	let copiedInviteLink = $state(false)

	const namePlaceholderMsg = $derived(msg(messages.namePlaceholder))

	// The home workspace is a private, single-member space: it can be renamed but not shared,
	// joined, or deleted, so it shows the name field and a disabled "private workspace" invite
	// note — no shareable invite link, members list, or settings tabs.
	const isHomeWorkspace = fromComputed(
		'isHomeWorkspace',
		() => workspaceId === app.current.getHomeWorkspaceId()
	)
	const currentUserId = fromComputed('currentUserId', () => app.current.getUser().id)

	const role = $derived(
		workspaceMembership.groupMembers.find((m) => m.userId === currentUserId.current)?.role
	)
	const ownersCount = $derived(
		workspaceMembership.groupMembers.filter((m) => m.role === 'owner').length
	)
	// Leaving is allowed for everyone except the last owner — a workspace invariant
	// (it must always keep at least one owner), not a capability.
	const canLeave = $derived(role !== 'owner' || ownersCount > 1)
	const canManageWorkspace = $derived(can(role, 'manageWorkspace'))
	// Optional column: older cached rows without it (and the migration's default)
	// mean "enabled", so treat a missing value as true.
	const inviteLinkEnabled = $derived(workspace.inviteLinkEnabled ?? true)
	const roleLabels: Record<Role, string> = $derived({
		owner: msg(messages.owner),
		member: msg(messages.member),
	})
	// Owners sort above members; within a role the current user is pinned to the top.
	const roleOrder: Record<Role, number> = { owner: 0, member: 1 }
	const roleOptions = $derived(
		(Object.keys(roleLabels) as Role[]).map((value) => ({
			value,
			label: roleLabels[value],
		}))
	)

	// Owners first, then members; within a role, pin the current user to the top.
	const members = $derived(
		[...workspaceMembership.groupMembers].sort((a, b) => {
			if (a.role !== b.role) return roleOrder[a.role] - roleOrder[b.role]
			if (a.userId === currentUserId.current) return -1
			if (b.userId === currentUserId.current) return 1
			return 0
		})
	)

	// The overlay grid-centers the dialog, so it re-centers (and visibly jumps) whenever its
	// height changes between tabs. Anchor it near the top instead (Raycast-style): a stable
	// position that grows/shrinks downward as content changes. The max-height keeps a margin
	// below it so it never reaches the bottom of the viewport — past that the members list
	// scrolls (see .tabPage) while the name/invite/tabs stay put. vh keeps these correct
	// across window resizes.
	function anchorDialog(marker: HTMLElement) {
		const content = marker.closest('.tlui-dialog__content')
		if (!(content instanceof HTMLElement)) return
		content.style.alignSelf = 'start'
		content.style.marginTop = '20vh'
		content.style.maxHeight = '70vh'
	}

	// Shows the scrollbar of a scroll container only when the content actually overflows. The
	// container stays `overflow: hidden` (see .tabPage) and gets the `.scrollable` class —
	// flipping overflow to auto — once measurement shows the content is taller than the
	// (max-height-capped) container. A ResizeObserver on the container and its content re-checks
	// as members are added/removed or the window resizes.
	function scrollbarWhenScrollable(el: HTMLElement) {
		const update = () =>
			el.classList.toggle(styles.scrollable, el.scrollHeight > el.clientHeight + 1)
		update()
		const observer = new ResizeObserver(update)
		observer.observe(el)
		for (const child of el.children) observer.observe(child)
		return () => observer.disconnect()
	}

	async function handleCopyInviteLink() {
		if (copiedInviteLink) return
		if (!app.current.copyWorkspaceInvite(workspaceId, false)) return
		copiedInviteLink = true
		setTimeout(() => (copiedInviteLink = false), 1000)
	}

	async function handleToggleInviteLink(enabled: boolean) {
		const a = app.current
		const res = await a.z.mutate.setWorkspaceInviteLinkEnabled({ id: workspaceId, enabled }).client
		if (res.type === 'error') {
			a.showMutationRejectionToast(res.error)
			return
		}
		trackEvent('set-workspace-invite-link-enabled', { source: 'workspace-settings', enabled })
	}

	async function handleRegenerateInviteLink() {
		const a = app.current
		const res = await a.z.mutate.regenerateWorkspaceInviteSecret({ id: workspaceId }).server
		if (res.type === 'error') {
			a.showMutationRejectionToast(res.error)
			return
		}
		trackEvent('regenerate-workspace-invite-secret', { source: 'workspace-settings' })
	}

	// Read before the mutation: afterwards the file may already be gone from the local store.
	function isViewingFileInThisWorkspace() {
		const fileId = currentFileId.current
		return !!fileId && app.current.getFile(fileId)?.owningGroupId === workspaceId
	}

	async function handleLeaveWorkspace() {
		const a = app.current
		const isCurrentlyOnAFileInThisWorkspace = isViewingFileInThisWorkspace()
		const mutation = a.z.mutate.leaveWorkspace({ workspaceId })
		const clientRes = await mutation.client
		if (clientRes.type === 'error') {
			a.showMutationRejectionToast(clientRes.error)
			return
		}
		// The last-owner check runs against local rows, so two owners leaving at once both pass
		// locally and the server rejects one. Wait for it before navigating away.
		const serverRes = await mutation.server
		if (serverRes.type === 'error') {
			a.showMutationRejectionToast(serverRes.error)
			return
		}
		trackEvent('leave-workspace', { source: 'workspace-settings' })
		onClose()
		if (isCurrentlyOnAFileInThisWorkspace) {
			navigate('/')
		}
	}

	async function handleDeleteWorkspace() {
		const a = app.current
		const isCurrentlyOnAFileInThisWorkspace = isViewingFileInThisWorkspace()
		const res = await a.z.mutate.deleteWorkspace({ id: workspaceId }).client
		if (res.type === 'error') {
			a.showMutationRejectionToast(res.error)
			return
		}
		trackEvent('delete-workspace', { source: 'workspace-settings' })
		onClose()
		if (isCurrentlyOnAFileInThisWorkspace) {
			navigate('/')
		}
	}

	async function handleRemoveMember(targetUserId: string) {
		const a = app.current
		const res = await a.z.mutate.removeWorkspaceMember({ workspaceId, targetUserId }).client
		if (res.type === 'error') {
			a.showMutationRejectionToast(res.error)
			return
		}
		trackEvent('remove-workspace-member', { source: 'workspace-settings' })
	}

	function openRegenerateConfirmDialog() {
		addDialog({
			component: withDialogProps(ConfirmDialog, {
				title: regenerateInviteLinkLabel,
				description: regenerateDescription,
				confirmLabel: regenerateConfirmLabel,
				cancelLabel: cancelLabel,
				confirmType: 'danger' as const,
				onConfirm: handleRegenerateInviteLink,
			}),
		})
	}

	function openLeaveConfirmDialog() {
		addDialog({
			component: withDialogProps(ConfirmDialog, {
				title: leaveWorkspaceLabel,
				description: leaveDescription,
				confirmLabel: leaveLabel,
				cancelLabel: cancelLabel,
				confirmType: 'danger' as const,
				onConfirm: handleLeaveWorkspace,
			}),
		})
	}

	function openDeleteConfirmDialog() {
		addDialog({
			component: withDialogProps(ConfirmDialog, {
				title: deleteWorkspaceLabel,
				description: deleteDescription,
				confirmLabel: deleteConfirmLabel,
				cancelLabel: cancelLabel,
				confirmType: 'danger' as const,
				onConfirm: handleDeleteWorkspace,
			}),
		})
	}

	function openRemoveConfirmDialog(member: { userId: string; userName: string }) {
		addDialog({
			component: withDialogProps(ConfirmDialog, {
				title: removeMemberTitle,
				description: msg(messages.removeDescription, { name: member.userName }),
				confirmLabel: removeLabel,
				cancelLabel: cancelLabel,
				confirmType: 'danger' as const,
				onConfirm: () => handleRemoveMember(member.userId),
			}),
		})
	}
</script>

{#snippet cancelLabel()}<F {...messages.cancel} />{/snippet}
{#snippet leaveLabel()}<F {...messages.leave} />{/snippet}
{#snippet removeLabel()}<F {...messages.remove} />{/snippet}
{#snippet mustKeepOwnerLabel()}<F {...messages.mustKeepOwner} />{/snippet}
{#snippet regenerateInviteLinkLabel()}<F {...messages.regenerateInviteLink} />{/snippet}
{#snippet regenerateDescription()}
	<F
		defaultMessage="Regenerating replaces the current invite link with a new one. Anyone using the old link will need the new one to join."
	/>
{/snippet}
{#snippet regenerateConfirmLabel()}<F defaultMessage="Regenerate" />{/snippet}
{#snippet leaveWorkspaceLabel()}<F {...messages.leaveWorkspace} />{/snippet}
{#snippet leaveDescription()}
	<F defaultMessage="Are you sure you want to leave this workspace?" />
{/snippet}
{#snippet deleteWorkspaceLabel()}<F {...messages.deleteWorkspace} />{/snippet}
{#snippet strong(chunks: string)}<strong>{chunks}</strong>{/snippet}
{#snippet deleteDescription()}
	<F
		defaultMessage={"Are you sure you want to delete <strong>{workspaceName}</strong>? This action cannot be undone."}
		values={{ workspaceName: workspace.name || namePlaceholderMsg }}
		tags={{ strong }}
	/>
{/snippet}
{#snippet deleteConfirmLabel()}<F defaultMessage="Delete" />{/snippet}
{#snippet removeMemberTitle()}<F defaultMessage="Remove member" />{/snippet}

<Tooltip.Provider>
	<!-- Marker used to find the dialog content element and anchor its position (see above). -->
	<div {@attach anchorDialog} hidden></div>
	<SvelteDrawUiDialogHeader>
		<SvelteDrawUiDialogTitle>
			<F defaultMessage="Manage workspace" />
		</SvelteDrawUiDialogTitle>
		<SvelteDrawUiDialogCloseButton />
	</SvelteDrawUiDialogHeader>
	<SvelteDrawUiDialogBody class={styles.workspaceSettingsBody}>
		<!-- Shared header: name + invite link, shown above both tabs. -->
		<div class={styles.section}>
			<div class={styles.sectionLabel}>
				<F defaultMessage="Name" />
			</div>
			<!-- Renaming requires the manageWorkspace capability (enforced by the mutator). -->
			<!-- Untracked: the name live-saves, and re-applying the saved (trimmed) name to the field
			     while typing would eat trailing spaces. React's defaultValue was likewise read once. -->
			<SvelteDrawUiInput
				class={styles.dialogInput}
				defaultValue={untrack(() => workspace.name)}
				disabled={!canManageWorkspace}
				onValueChange={(value) => {
					const name = value.trim()
					if (name && name !== workspace.name) {
						app.current.z.mutate.updateWorkspace({ id: workspaceId, name })
					}
				}}
				placeholder={namePlaceholderMsg}
				maxLength={MAX_WORKSPACE_NAME_LENGTH}
				autoSelect
			/>
		</div>

		<!-- The home workspace is private and can't be shared, so show a disabled invite
		     control with a note pointing the user to creating a shared workspace instead. -->
		{#if isHomeWorkspace.current}
			<div class={styles.section}>
				<div class={styles.sectionLabel}>
					<F {...messages.inviteTeammates} />
				</div>
				<TlaButton iconRight="copy" variant="secondary" big disabled>
					<F {...messages.copyInviteLink} />
				</TlaButton>
				<p class={styles.sectionHelp}>
					<F
						defaultMessage="This is your private workspace. Create a new workspace to invite teammates."
					/>
				</p>
			</div>
		{/if}

		<!-- Invite link, members, and settings apply only to shared workspaces. -->
		{#if !isHomeWorkspace.current}
			<div class={styles.section}>
				<div class={styles.sectionLabel}>
					<F {...messages.inviteTeammates} />
				</div>
				{#if inviteLinkEnabled}
					<TlaButton
						iconRight={copiedInviteLink ? 'check' : 'copy'}
						iconRightClassName={styles.copyInviteLinkIconRight}
						variant="primary"
						big
						onclick={handleCopyInviteLink}
					>
						<F {...messages.copyInviteLink} />
					</TlaButton>
				{:else}
					<TlaButton variant="secondary" big disabled>
						<F defaultMessage="Invites are disabled" />
					</TlaButton>
				{/if}
			</div>

			<TlaMenuTabsRoot {activeTab} onTabChange={(tab) => (activeTab = tab)}>
				<!-- The shared tabs inset their labels by the tab padding; pull the strip out
				     by that amount so the first tab's label lines up with the headings, button,
				     and member rows. The underline still spans the content width. -->
				<div class={styles.workspaceTabs}>
					<TlaMenuTabsTabs>
						<TlaMenuTabsTab id="members">
							<F defaultMessage="Members" />
						</TlaMenuTabsTab>
						<TlaMenuTabsTab id="settings">
							<F defaultMessage="Settings" />
						</TlaMenuTabsTab>
					</TlaMenuTabsTabs>
				</div>

				<TlaMenuTabsPage id="members">
					<div class={styles.tabPage} {@attach scrollbarWhenScrollable}>
						<div class={styles.membersList}>
							{#each members as member (member.userId)}
								{@const isSelf = member.userId === currentUserId.current}
								<!-- Whether this member is an owner; used to hide non-owner roles from
								     viewers who can't manage the workspace. -->
								{@const memberIsOwner = can(member.role, 'manageWorkspace')}
								<!-- A workspace must keep at least one owner, so the last owner can't be
								     removed (this also covers an owner removing themselves). -->
								{@const canRemoveMember = !memberIsOwner || ownersCount > 1}
								<!-- For the same reason the last owner can't be demoted to member, so
								     disable that option rather than letting the change silently no-op. -->
								{@const memberRoleOptions = canRemoveMember
									? roleOptions
									: roleOptions.map((option) =>
											option.value === 'member' ? { ...option, disabled: true } : option
										)}
								<div class={styles.memberItem}>
									<div
										class={styles.memberAvatar}
										style:background-color={member.userColor || '#ff6b35'}
									>
										{member.userName.charAt(0).toUpperCase()}
									</div>
									<span class={styles.memberName}>
										{member.userName}
										{isSelf ? ` (${msg(messages.you)})` : ''}
									</span>
									{#if canManageWorkspace}
										<!-- Everyone — including yourself — can be removed; it's disabled when
										     removal would leave the workspace without an owner. On your own
										     row this is "Leave" and routes to the leave flow. -->
										<TlaMenuSelect
											id={`workspace-member-role-${member.userId}`}
											label={roleLabels[member.role]}
											value={member.role}
											options={memberRoleOptions}
											actions={[
												{
													id: 'remove',
													label: isSelf ? leaveLabel : removeLabel,
													destructive: true,
													disabled: !canRemoveMember,
													tooltip: canRemoveMember ? undefined : mustKeepOwnerLabel,
													onSelect: () =>
														isSelf ? openLeaveConfirmDialog() : openRemoveConfirmDialog(member),
												},
											]}
											onChange={async (value) => {
												if (value === member.role) return
												const a = app.current
												const res = await a.z.mutate.setWorkspaceMemberRole({
													workspaceId,
													targetUserId: member.userId,
													role: value,
												}).client
												if (res.type === 'error') {
													a.showMutationRejectionToast(res.error)
													return
												}
												trackEvent('set-workspace-member-role', {
													source: 'workspace-settings',
													role: value,
												})
											}}
										/>
									{:else if memberIsOwner}
										<span class={styles.memberRole}>{roleLabels[member.role]}</span>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				</TlaMenuTabsPage>

				<TlaMenuTabsPage id="settings">
					<div class={styles.tabPage} {@attach scrollbarWhenScrollable}>
						<div class={styles.settingsPage}>
							{#if canManageWorkspace}
								<TlaMenuControl>
									<TlaMenuControlLabel htmlFor="workspace-invite-enabled-switch">
										<F defaultMessage="Enable invites" />
									</TlaMenuControlLabel>
									<TlaMenuSwitch
										id="workspace-invite-enabled-switch"
										checked={inviteLinkEnabled}
										onChange={handleToggleInviteLink}
									/>
								</TlaMenuControl>
								<button
									type="button"
									class={styles.inlineButton}
									onclick={openRegenerateConfirmDialog}
								>
									<F {...messages.regenerateInviteLink} />
								</button>
							{/if}
							{#if canLeave}
								<button type="button" class={styles.inlineButton} onclick={openLeaveConfirmDialog}>
									<F {...messages.leaveWorkspace} />
								</button>
							{:else}
								<SvelteDrawUiTooltip content={mustKeepOwnerLabel}>
									{#snippet child({ props })}
										<button type="button" class={styles.inlineButton} disabled {...props}>
											<F {...messages.leaveWorkspace} />
										</button>
									{/snippet}
								</SvelteDrawUiTooltip>
							{/if}
							{#if canManageWorkspace}
								<button
									type="button"
									class={[styles.inlineButton, styles.inlineButtonDanger]}
									onclick={openDeleteConfirmDialog}
								>
									<F {...messages.deleteWorkspace} />
								</button>
							{/if}
						</div>
					</div>
				</TlaMenuTabsPage>
			</TlaMenuTabsRoot>
		{/if}
	</SvelteDrawUiDialogBody>
</Tooltip.Provider>
