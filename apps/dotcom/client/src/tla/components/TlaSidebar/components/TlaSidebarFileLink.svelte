<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	export const sidebarMessages = defineMessages({
		renameFile: { defaultMessage: 'Rename file' },
		selected: { defaultMessage: 'selected' },
	})

	const ACTIVE_FILE_LINK_ID = 'tla-active-file-link'
	let preventScrollOnNavigation = false

	function scrollActiveFileLinkIntoView() {
		// Check if we should prevent scrolling due to sidebar click
		if (preventScrollOnNavigation) return
		document
			.getElementById(ACTIVE_FILE_LINK_ID)
			?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
	}

	// Suppresses the scroll-into-view for the navigation a sidebar click itself triggers; the flag
	// self-clears so a later external navigation (e.g. create/delete) still scrolls.
	function setPreventScrollOnNavigation(value: boolean) {
		preventScrollOnNavigation = value
		if (value) {
			// Clear the flag after a short delay to allow for immediate navigation
			setTimeout(() => {
				preventScrollOnNavigation = false
			}, 100)
		}
	}
</script>

<script lang="ts">
	import { ContextMenu, mergeProps } from 'bits-ui'
	import { untrack } from 'svelte'
	import {
		F,
		fromComputed,
		getContainer,
		getDialogs,
		isEqual,
		nativeEvents,
		SvelteDrawUiMenuContextProvider,
		SvelteDrawUiTooltip,
	} from 'svelte-draw'
	import { routes } from '../../../../routeDefs'
	import { navigate, params } from '../../../../utils/router.svelte'
	import { withDialogProps } from '../../../../utils/withDialogProps'
	import { getApp } from '../../../hooks/useAppState.svelte'
	import { getIntl } from '../../../../utils/intl'
	import { getSvelteDrawAppUiEvents } from '../../../utils/app-ui-events'
	import { getIsCoarsePointer } from '../../../utils/getIsCoarsePointer'
	import { globalEditor } from '../../../../utils/globalEditor'
	import {
		isSidebarOpenMobile,
		toggleMobileSidebar,
	} from '../../../utils/local-session-state'
	import FileItems from '../../TlaFileMenu/FileItems.svelte'
	import TlaIcon from '../../TlaIcon/TlaIcon.svelte'
	import { createGlobalEditorMenuIsOpen } from './createGlobalEditorMenuIsOpen.svelte'
	import { fromDerivedComputed } from '../../../hooks/fromDerivedComputed.svelte'
	import type { RecentFile } from './sidebar-shared'
	import TlaSidebarFileLinkMenu from './TlaSidebarFileLinkMenu.svelte'
	import TlaSidebarRenameDialog from './TlaSidebarRenameDialog.svelte'
	import TlaSidebarRenameInline from './TlaSidebarRenameInline.svelte'
	import styles from '../sidebar.module.css'

	let {
		item,
		testId,
		class: className,
		workspaceId,
	}: {
		item: RecentFile
		testId: string
		workspaceId: string
		class?: string
	} = $props()

	const app = getApp()
	const intl = getIntl()
	const { addDialog } = getDialogs()
	const container = getContainer()
	const trackEvent = getSvelteDrawAppUiEvents()

	const fileId = $derived(item.fileId)
	const isActive = $derived(params.fileSlug === fileId)
	const href = $derived(routes.tlaFile(fileId))

	const fileName = fromDerivedComputed(
		'file name',
		() => fileId,
		(id) => app.current.getFileName(id)
	)
	const file = fromDerivedComputed(
		'file',
		() => fileId,
		(id) => app.current.getFile(id)
	)
	const isRenaming = fromDerivedComputed(
		'shouldRename',
		() => ({ fileId, workspaceId }),
		(key) => isEqual(app.current.sidebarState.get().renameState, key)
	)
	const hasAdminRights = fromDerivedComputed(
		'hasFileAdminRights',
		() => fileId,
		(id) => app.current.canUpdateFile(id)
	)
	const enhancedA11yMode = fromComputed('enhancedA11yMode', () =>
		globalEditor.get()?.user.getEnhancedA11yMode()
	)
	const isMobile = fromComputed('isMobile', () => getIsCoarsePointer())
	// disable dragging on mobile
	const isDragEnabled = $derived(!isMobile.current)

	// The parent's single getWorkspaceFilesSorted pass already decided this; recomputing it per
	// link (useIsFilePinned) repeats that whole sort for every row on each membership change.
	const isPinned = $derived(item.isPinned)

	let linkRef = $state<HTMLAnchorElement | null>(null)

	$effect(() => {
		if (isActive) {
			void fileId
			scrollActiveFileLinkIntoView()
		}
	})

	$effect(() => {
		// Reruns on `isActive` and the file changing, like the React effect's deps; the link element
		// appearing later (the row was empty or renaming) does not re-focus.
		void fileId
		if (!isActive) return
		const link = untrack(() => linkRef)
		if (!link) return
		// Don't focus if any menus are open to prevent dismissing them
		if (globalEditor.get()?.menus.hasAnyOpenMenus()) return
		// Don't steal focus from a text field the user is typing in. The active
		// link remounts as files filter in and out of the sidebar search results,
		// and its mount-time focus would otherwise blur the search input.
		const activeEl = link.ownerDocument.activeElement as HTMLElement | null
		if (activeEl && activeEl !== link) {
			const tagName = activeEl.tagName.toLowerCase()
			if (tagName === 'input' || tagName === 'textarea' || activeEl.isContentEditable) return
		}
		link.focus({ preventScroll: preventScrollOnNavigation })
	})

	function handleRenameAction() {
		if (isMobile.current) {
			addDialog({
				component: withDialogProps(TlaSidebarRenameDialog, {
					fileId,
					fileName: fileName.current,
				}),
			})
		} else {
			app.current.sidebarState.update((prev) => ({
				...prev,
				renameState: { fileId, workspaceId },
			}))
		}
	}

	const menu = createGlobalEditorMenuIsOpen(() => `file-context-menu-${fileId}`)

	function onRenameClose() {
		app.current.sidebarState.update((prev) => ({ ...prev, renameState: null }))
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (!isActive || !hasAdminRights.current) return
		if (e.key === 'Enter') {
			handleRenameAction()
		}
	}

	function handleDragStart(event: DragEvent) {
		// Dragging a file just drags its URL, like dragging a link. This
		// lets the user drag a file out to a new tab or another app; it no
		// longer reorders or unpins files (that happens via the file menu).
		const fileUrl = routes.tlaFile(fileId, { asUrl: true })
		if (!event.dataTransfer) return
		event.dataTransfer.effectAllowed = 'copyLink'
		event.dataTransfer.setData('text/uri-list', fileUrl)
		event.dataTransfer.setData('text/plain', fileUrl)
	}

	// Native, so that `preventDefault` lands before the router's own click handler.
	const linkClick = nativeEvents<HTMLAnchorElement>({
		click(event) {
			// Don't navigate if we are already on the file page
			// unless the user is holding ctrl or cmd to open in a new tab
			if (isActive && !(event.ctrlKey || event.metaKey)) {
				event.preventDefault()
			} else {
				// Set flag to prevent scrolling when navigation occurs due to sidebar click
				setPreventScrollOnNavigation(true)
			}
			if (isSidebarOpenMobile.current) {
				toggleMobileSidebar(false)
			}
			trackEvent('click-file-link', { source: 'sidebar' })
		},
	})

	const searchQuery = fromComputed('sidebar search query', () =>
		app.current.sidebarState.get().searchQuery.trim()
	)

	// Renders a file name, bolding any portions that match the active sidebar
	// search query. With no query it just renders the plain name.
	function getNameParts(name: string, query: string): { text: string; match: boolean }[] {
		if (!query) return [{ text: name, match: false }]
		const lowerName = name.toLowerCase()
		const lowerQuery = query.toLowerCase()
		const parts: { text: string; match: boolean }[] = []
		let start = 0
		let matchIndex = lowerName.indexOf(lowerQuery)
		if (matchIndex === -1) return [{ text: name, match: false }]

		while (matchIndex !== -1) {
			if (matchIndex > start) parts.push({ text: name.slice(start, matchIndex), match: false })
			const end = matchIndex + query.length
			parts.push({ text: name.slice(matchIndex, end), match: true })
			start = end
			matchIndex = lowerName.indexOf(lowerQuery, start)
		}
		if (start < name.length) parts.push({ text: name.slice(start), match: false })

		return parts
	}

	const nameParts = $derived(getNameParts(fileName.current, searchQuery.current))

	const ownerName = $derived(file.current?.ownerName.trim() ?? '')
</script>

{#snippet guestBadgeTooltip()}
	{#if ownerName}
		<F defaultMessage={`Shared by {ownerName}`} values={{ ownerName }} />
	{:else}
		<F defaultMessage="Shared with you" />
	{/if}
{/snippet}

<ContextMenu.Root onOpenChange={menu.onOpenChange}>
	<ContextMenu.Trigger>
		{#snippet child({ props })}
			<!-- bits-ui makes the trigger focusable (tabindex -1); Radix's trigger was not. -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<span {...props} tabindex={undefined}>
				{#if file.current}
					{#if isRenaming.current}
						<TlaSidebarRenameInline
							source="sidebar"
							{fileId}
							onClose={onRenameClose}
							active={isActive}
						/>
					{:else}
						<div
							class={[styles.sidebarFileListItem, styles.hoverable, className]}
							data-enhanced-a11y-mode={enhancedA11yMode.current}
							data-active={isActive}
							data-element="file-link"
							data-testid={testId}
							data-is-own-file={hasAdminRights.current}
							ondblclick={hasAdminRights.current ? handleRenameAction : undefined}
							data-drop-target-id={`file:${fileId}`}
							data-is-pinned={isPinned}
							id={
								// We use this id to scroll the active file link into view when creating or deleting files.
								isActive ? ACTIVE_FILE_LINK_ID : undefined
							}
							role="listitem"
							draggable={isDragEnabled}
							ondragstart={isDragEnabled ? handleDragStart : undefined}
						>
							<a
								bind:this={linkRef}
								onkeydown={handleKeyDown}
								aria-label={fileName.current +
									(isActive ? ` (${intl.current.formatMessage(sidebarMessages.selected)})` : '')}
								{@attach linkClick}
								{href}
								class={styles.sidebarFileListItemButton}
								draggable={false}
							></a>
							<div class={styles.sidebarFileListItemContent}>
								<div
									class={[styles.sidebarFileListItemLabel, 'tla-text_ui__regular', 'notranslate']}
									data-testid={`${testId}-name`}
								>
									{#each nameParts as part, i (i)}
										{#if part.match}
											<strong class={styles.sidebarFileListItemLabelMatch}>{part.text}</strong>
										{:else}
											{part.text}
										{/if}
									{/each}
								</div>
								{#if !hasAdminRights.current && file.current}
									<div
										class={styles.sidebarFileListItemGuestBadge}
										data-testid={`guest-badge-${file.current.name}`}
									>
										<SvelteDrawUiTooltip content={guestBadgeTooltip}>
											{#snippet child({ props: tooltipProps })}
												<!-- this is needed to prevent the tooltip from closing when clicking the badge -->
												<div
													dir="ltr"
													{...mergeProps(tooltipProps, {
														onclick: (e: MouseEvent) => {
															e.preventDefault()
															// the tool tip needs pointer events in order to accept the click...
															// but that means it also blocks the link to the file. Here we bend
															// the world to our will, ruling by desire: clicking the tooltip will
															// navigate to the file
															navigate(href)
														},
													})}
													class={styles.sidebarFileListItemGuestBadgeTrigger}
												>
													<TlaIcon icon="group" class="tlui-guest-icon" />
												</div>
											{/snippet}
										</SvelteDrawUiTooltip>
									</div>
								{/if}
							</div>
							<TlaSidebarFileLinkMenu {workspaceId} {fileId} onRenameAction={handleRenameAction} />
						</div>
					{/if}
				{/if}
			</span>
		{/snippet}
	</ContextMenu.Trigger>
	<ContextMenu.Portal to={container}>
		<ContextMenu.Content class="tlui-menu tlui-scrollable" preventScroll={false}>
			<!-- Don't show the context menu on mobile -->
			{#if !isMobile.current}
				<SvelteDrawUiMenuContextProvider type="context-menu" sourceId="context-menu">
					<FileItems
						source="sidebar-context-menu"
						{fileId}
						onRenameAction={handleRenameAction}
						{workspaceId}
					/>
				</SvelteDrawUiMenuContextProvider>
			{/if}
		</ContextMenu.Content>
	</ContextMenu.Portal>
</ContextMenu.Root>
