<script lang="ts">
	import { getTranslation, SvelteDrawUiButton } from 'svelte-draw'
	import { getSvelteDrawAppUiEvents } from '../../../utils/app-ui-events'
	import { getIsSidebarOpen, toggleSidebar } from '../../../utils/local-session-state'
	import TlaIcon from '../../TlaIcon/TlaIcon.svelte'
	import { getHideSidebarToggle, messages } from './sidebar-shared'
	import styles from '../sidebar.module.css'

	const msg = getTranslation()
	const trackEvent = getSvelteDrawAppUiEvents()
	const toggleLbl = $derived(msg(messages.toggleSidebar))
	const hideSidebarToggle = getHideSidebarToggle()
</script>

{#if !hideSidebarToggle.current}
	<SvelteDrawUiButton
		type="icon"
		class={styles.sidebarToggle}
		data-mobile={false}
		data-testid="tla-sidebar-toggle"
		tooltip={toggleLbl}
		title={toggleLbl}
		onclick={() => {
			toggleSidebar()
			trackEvent('sidebar-toggle', {
				value: getIsSidebarOpen(),
				source: 'sidebar',
			})
		}}
	>
		<TlaIcon icon="sidebar-strong" />
	</SvelteDrawUiButton>
{/if}
