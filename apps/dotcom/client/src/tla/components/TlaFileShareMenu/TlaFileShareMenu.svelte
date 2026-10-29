<script lang="ts">
	import type { Snippet } from 'svelte'
	import {
		F,
		fromComputed,
		SvelteDrawUiPopover,
		SvelteDrawUiPopoverContent,
		SvelteDrawUiPopoverTrigger,
	} from 'svelte-draw'
	import { getMaybeApp } from '../../hooks/useAppState.svelte'
	import { getHasFileAdminRights } from '../../hooks/useIsFileOwner.svelte'
	import { getSvelteDrawAppUiEvents } from '../../utils/app-ui-events'
	import { getLocalSessionState, updateLocalSessionState } from '../../utils/local-session-state'
	import TlaMenuTabsPage from '../tla-menu/TlaMenuTabsPage.svelte'
	import TlaMenuTabsRoot from '../tla-menu/TlaMenuTabsRoot.svelte'
	import TlaMenuTabsTab from '../tla-menu/TlaMenuTabsTab.svelte'
	import TlaMenuTabsTabs from '../tla-menu/TlaMenuTabsTabs.svelte'
	import { TLA_MENU_POSITION } from '../tla-menu/tla-menu-position'
	import { fromDerivedComputed } from '../../hooks/fromDerivedComputed.svelte'
	import TlaAnonCopyLinkTab from './Tabs/TlaAnonCopyLinkTab.svelte'
	import TlaExportTab from './Tabs/TlaExportTab.svelte'
	import TlaInviteTab from './Tabs/TlaInviteTab.svelte'
	import TlaPublishTab from './Tabs/TlaPublishTab.svelte'
	import styles from './file-share-menu.module.css'

	let {
		fileId,
		context,
		source,
		trigger,
		onOpenChange,
	}: {
		// this share menu is shown when viewing a file, or a published file (snapshot), or when the logged out user is on the root (the scratchpad)
		context: 'file' | 'published-file' | 'scratch' | 'legacy'
		fileId?: string
		source: string
		/**
		 * The trigger element: render it and spread `props` on it (React took the trigger as
		 * `children`). Without the spread the popover has no trigger.
		 */
		trigger: Snippet<[{ props: Record<string, unknown> }]>
		onOpenChange?(isOpen: boolean): void
	} = $props()

	const trackEvent = getSvelteDrawAppUiEvents()
	const app = getMaybeApp()

	const shareMenuActiveTab = fromComputed(
		'share menu active tab',
		() => getLocalSessionState().shareMenuActiveTab
	)

	const hasAdminRights = getHasFileAdminRights(() => fileId)

	const file = fromDerivedComputed(
		'file',
		() => fileId,
		(id) => (id ? app.current?.getFile(id) : undefined)
	)

	function handleTabChange(value: string) {
		const tab = value as 'share' | 'export' | 'publish'
		updateLocalSessionState(() => ({ shareMenuActiveTab: tab }))
		trackEvent('change-share-menu-tab', { tab, source: 'file-share-menu' })
	}

	const okTabs = $derived({
		// If the context is a guest file or published file, show the anon share file
		'anon-share':
			!hasAdminRights.current &&
			(context === 'file' || context === 'published-file' || context === 'legacy'),
		export: true,
		// Can the current user configure the file's sharing settings?
		share: !!(context === 'file' && fileId && file.current && hasAdminRights.current),
		// Can the current user configure the file's publishing settings?
		publish: !!(context === 'file' && fileId && file.current && hasAdminRights.current),
	})

	const tabToShowAsActive = $derived.by(() => {
		let tab = shareMenuActiveTab.current

		// If the user is not signed in and their local active tab is share, then show the anon share tab
		if (tab === 'share' && !okTabs.share) {
			tab = 'anon-share'
		}

		// If we're on a tab that we're not allowed to be on, then switch to the first tab we're allowed to be on
		if (!okTabs[tab]) {
			tab = 'export'
		}
		return tab
	})

	// todo: replace disabled tabs for signed out users with "sign in to do X" content
</script>

<SvelteDrawUiPopover id={`share-${fileId}-${source}`} {onOpenChange}>
	<SvelteDrawUiPopoverTrigger child={trigger} />

	<SvelteDrawUiPopoverContent
		side="bottom"
		align="end"
		{...TLA_MENU_POSITION}
		autoFocusFirstButton={false}
	>
		<div class={styles.fileShareMenu}>
			<TlaMenuTabsRoot activeTab={tabToShowAsActive} onTabChange={handleTabChange}>
				<TlaMenuTabsTabs>
					<!-- Disable share when on a scratchpad file -->
					{#if okTabs.share}
						<TlaMenuTabsTab id="share" data-testid="tla-share-tab-button-share">
							<F defaultMessage="Invite" />
						</TlaMenuTabsTab>
					{/if}
					{#if okTabs['anon-share']}
						<TlaMenuTabsTab id="anon-share" data-testid="tla-share-tab-button-anon-share">
							<F defaultMessage="Share" />
						</TlaMenuTabsTab>
					{/if}
					<!-- Always show export -->
					<TlaMenuTabsTab id="export" data-testid="tla-share-tab-button-export">
						<F defaultMessage="Export" />
					</TlaMenuTabsTab>
					<!-- Show publish tab when there's a file and either the context is a published file or the user owns the file -->
					{#if okTabs.publish}
						<TlaMenuTabsTab id="publish" data-testid="tla-share-tab-button-publish">
							<F defaultMessage="Publish" />
						</TlaMenuTabsTab>
					{/if}
				</TlaMenuTabsTabs>
				{#if okTabs.share && fileId}
					<!-- We have a file and we're authenticated -->
					<TlaMenuTabsPage id="share" data-testid="tla-share-tab-page-share">
						<TlaInviteTab {fileId} />
					</TlaMenuTabsPage>
				{/if}
				{#if okTabs['anon-share']}
					<TlaMenuTabsPage id="anon-share" data-testid="tla-share-tab-page-anon-share">
						<TlaAnonCopyLinkTab />
					</TlaMenuTabsPage>
				{/if}
				<TlaMenuTabsPage id="export" data-testid="tla-share-tab-page-export">
					<TlaExportTab />
				</TlaMenuTabsPage>
				<!-- Only show the publish tab if the file is owned by the user -->
				{#if okTabs.publish && file.current}
					<TlaMenuTabsPage id="publish" data-testid="tla-share-tab-page-publish">
						<TlaPublishTab file={file.current} />
					</TlaMenuTabsPage>
				{/if}
			</TlaMenuTabsRoot>
		</div>
	</SvelteDrawUiPopoverContent>
</SvelteDrawUiPopover>
