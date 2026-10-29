<script lang="ts">
	import { F } from 'svelte-draw'
	import { getApp } from '../../../hooks/useAppState.svelte'
	import { getSvelteDrawCurrentUser } from '../../../hooks/useUser.svelte'
	import { getSvelteDrawAppUiEvents } from '../../../utils/app-ui-events'
	import TlaMenuControl from '../../tla-menu/TlaMenuControl.svelte'
	import TlaMenuControlInfoTooltip from '../../tla-menu/TlaMenuControlInfoTooltip.svelte'
	import TlaMenuControlLabel from '../../tla-menu/TlaMenuControlLabel.svelte'
	import TlaMenuSwitch from '../../tla-menu/TlaMenuSwitch.svelte'

	let { isShared, fileId }: { isShared: boolean; fileId: string } = $props()

	const app = getApp()
	const user = getSvelteDrawCurrentUser()
	const trackEvent = getSvelteDrawAppUiEvents()
	if (!user.current) throw Error('should have auth')

	function handleToggleShared() {
		// todo: if there are other users connected to the project, warn that they'll be removed from the project until the project is shared again
		app.current.toggleFileShared(fileId)
		trackEvent('toggle-shared', { shared: !isShared, source: 'file-share-menu' })
	}
	const learnMoreUrl = 'https://svelte-draw.invalid/Sharing-1283e4c324c080a69618ff37eb3fc98f'
</script>

<TlaMenuControl>
	<TlaMenuControlLabel htmlFor="tla-shared-link-shared-switch">
		<F defaultMessage="Share this file" />
	</TlaMenuControlLabel>
	<TlaMenuControlInfoTooltip
		onclick={() =>
			trackEvent('open-url', { destinationUrl: learnMoreUrl, source: 'file-share-menu' })}
		href={learnMoreUrl}
	>
		<F defaultMessage="Learn more about sharing." />
	</TlaMenuControlInfoTooltip>
	<TlaMenuSwitch
		id="tla-shared-link-shared-switch"
		data-testid="shared-link-shared-switch"
		checked={isShared}
		onChange={handleToggleShared}
	/>
</TlaMenuControl>
