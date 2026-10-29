<script lang="ts">
	import { usePassThroughWheelEvents } from 'svelte-draw'
	import styles from './top.module.css'
	import TlaEditorTopLeftPanelAnonymous from './top-left-panel/TlaEditorTopLeftPanelAnonymous.svelte'
	import TlaEditorTopLeftPanelSignedIn from './top-left-panel/TlaEditorTopLeftPanelSignedIn.svelte'

	// There are some styles in tla.css that adjust the regular tlui top panels
	let { isAnonUser }: { isAnonUser: boolean } = $props()

	const passThroughWheelEvents = usePassThroughWheelEvents()
</script>

<div {@attach passThroughWheelEvents} class={styles.topLeftPanel}>
	<div class={styles.topLeftPanelButtons}>
		{#if isAnonUser}
			<TlaEditorTopLeftPanelAnonymous />
		{:else}
			<TlaEditorTopLeftPanelSignedIn />
		{/if}
	</div>
</div>
