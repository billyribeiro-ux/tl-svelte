<script lang="ts">
	import { getTranslation, SvelteDrawUiButton } from 'svelte-draw'
	import { getSvelteDrawAppUiEvents } from '../../../utils/app-ui-events'
	import { getIsSidebarOpenMobile, toggleMobileSidebar } from '../../../utils/local-session-state'
	import TlaIcon from '../../TlaIcon/TlaIcon.svelte'
	import { getHideSidebarToggle, messages } from './sidebar-shared'
	import styles from '../sidebar.module.css'

	const msg = getTranslation()
	const trackEvent = getSvelteDrawAppUiEvents()
	const toggleSidebarLbl = $derived(msg(messages.toggleSidebar))
	const hideSidebarToggle = getHideSidebarToggle()
</script>

{#if !hideSidebarToggle.current}
	<SvelteDrawUiButton
		type="icon"
		class={styles.sidebarToggle}
		data-mobile={true}
		data-testid="tla-sidebar-toggle-mobile"
		tooltip={toggleSidebarLbl}
		title={toggleSidebarLbl}
		onclick={() => {
			toggleMobileSidebar()
			trackEvent('sidebar-toggle', {
				value: getIsSidebarOpenMobile(),
				source: 'sidebar',
			})
		}}
	>
		<TlaIcon icon="sidebar-strong" />
	</SvelteDrawUiButton>
{/if}
