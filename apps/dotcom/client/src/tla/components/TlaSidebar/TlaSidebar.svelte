<script lang="ts">
	import { tlmenus } from 'svelte-draw'
	import { getGlobalEditor } from '../../../utils/globalEditor'
	import { getActiveWorkspaceId } from '../../hooks/useActiveWorkspaceId.svelte'
	import { getTldrFileDrop } from '../../hooks/useTldrFileDrop.svelte'
	import { getSvelteDrawAppUiEvents } from '../../utils/app-ui-events'
	import {
		getIsSidebarOpen,
		isSidebarOpen,
		isSidebarOpenMobile,
		toggleMobileSidebar,
		toggleSidebar,
	} from '../../utils/local-session-state'
	import TlaSidebarCreateFileButton from './components/TlaSidebarCreateFileButton.svelte'
	import TlaSidebarDotDevLink from './components/TlaSidebarDotDevLink.svelte'
	import TlaSidebarFeedbackButton from './components/TlaSidebarFeedbackButton.svelte'
	import TlaSidebarNotificationsButton from './components/TlaSidebarNotificationsButton.svelte'
	import TlaSidebarRecentFiles from './components/TlaSidebarRecentFiles.svelte'
	import TlaSidebarUserSettingsMenu from './components/TlaSidebarUserSettingsMenu.svelte'
	import TlaSidebarWorkspaceActions from './components/TlaSidebarWorkspaceActions.svelte'
	import TlaSidebarWorkspaceLink from './components/TlaSidebarWorkspaceLink.svelte'
	import TlaSidebarWorkspaceSwitcher from './components/TlaSidebarWorkspaceSwitcher.svelte'
	import styles from './sidebar.module.css'

	const trackEvent = getSvelteDrawAppUiEvents()
	const globalEditor = getGlobalEditor()

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === '\\' && (e.ctrlKey || e.metaKey)) {
			toggleSidebar()
			trackEvent('sidebar-toggle', {
				value: getIsSidebarOpen(),
				source: 'sidebar',
			})
		}
	}

	function handleOverlayClick() {
		// The sidebar only hides (CSS transform), it doesn't unmount, so its portaled menus
		// (workspace switcher, file/user menus) would otherwise stay open over the canvas once the
		// sidebar is closed. Close them — scoped to this editor's menus plus the global switcher id.
		// The scope matters: open SDK dialogs register in the same tlmenus registry under the 'tla'
		// context, and an arg-less clearOpenMenus() would evict them while they stay mounted, leaving
		// the editor's menu-gated behavior (canvas click-capture, shortcuts, clipboard guards)
		// thinking nothing is open.
		const editor = globalEditor.current
		if (editor) tlmenus.clearOpenMenus(editor.contextId)
		tlmenus.deleteOpenMenu('sidebar-workspace-switcher')
		toggleMobileSidebar(false)
	}

	const { onDrop, onDragOver, onDragEnter, onDragLeave } = getTldrFileDrop()

	const activeWorkspaceId = getActiveWorkspaceId()
</script>

<svelte:window onkeydown={handleKeyDown} />

<nav
	aria-hidden={!isSidebarOpen.current}
	style:visibility={isSidebarOpen.current ? 'visible' : 'hidden'}
>
	<!-- svelte-ignore a11y_consider_explicit_label -->
	<button
		class={styles.sidebarOverlayMobile}
		data-visiblemobile={isSidebarOpenMobile.current}
		data-testid="tla-sidebar-overlay-mobile"
		onclick={handleOverlayClick}
	></button>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class={styles.sidebar}
		data-visible={isSidebarOpen.current}
		data-visiblemobile={isSidebarOpenMobile.current}
		data-testid="tla-sidebar"
		ondropcapture={onDrop}
		ondragover={onDragOver}
		ondragenter={onDragEnter}
		ondragleave={onDragLeave}
	>
		<div class={styles.sidebarTopRow}>
			<TlaSidebarWorkspaceLink />
			<div style="display: flex; align-items: center">
				<TlaSidebarNotificationsButton />
				<TlaSidebarCreateFileButton />
			</div>
		</div>
		<!-- The workspace switcher is fixed; only the file list below it scrolls. -->
		<TlaSidebarWorkspaceSwitcher />
		<div class={styles.sidebarDivider}></div>
		<TlaSidebarWorkspaceActions workspaceId={activeWorkspaceId.current} />
		<div class={styles.sidebarDivider}></div>
		<div class={styles.sidebarContent} data-sidebar-scroll-container>
			<div class={styles.sidebarContentInner}>
				<TlaSidebarRecentFiles />
			</div>
		</div>
		<div class={styles.sidebarBottomArea}>
			<div class={styles.sidebarDivider}></div>
			<TlaSidebarDotDevLink />
			<TlaSidebarFeedbackButton />
			<div class={styles.sidebarBottomRow}>
				<TlaSidebarUserSettingsMenu />
			</div>
		</div>
	</div>
</nav>
