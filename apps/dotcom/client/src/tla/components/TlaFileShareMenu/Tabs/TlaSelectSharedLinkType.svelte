<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		editor: { defaultMessage: 'Editor' },
		viewer: { defaultMessage: 'Viewer' },
		noAccess: { defaultMessage: 'No access' },
	})
</script>

<script lang="ts">
	import type { TlaFile } from '@svelte-draw/dotcom-shared'
	import { F, getTranslation } from 'svelte-draw'
	import { getApp } from '../../../hooks/useAppState.svelte'
	import { getSvelteDrawCurrentUser } from '../../../hooks/useUser.svelte'
	import { getSvelteDrawAppUiEvents } from '../../../utils/app-ui-events'
	import TlaMenuControl from '../../tla-menu/TlaMenuControl.svelte'
	import TlaMenuControlLabel from '../../tla-menu/TlaMenuControlLabel.svelte'
	import TlaMenuSelect from '../../tla-menu/TlaMenuSelect.svelte'
	import { fromDerivedComputed } from '../../../hooks/fromDerivedComputed.svelte'

	let { fileId }: { fileId: string } = $props()

	const msg = getTranslation()
	const app = getApp()
	const user = getSvelteDrawCurrentUser()
	const trackEvent = getSvelteDrawAppUiEvents()
	if (!user.current) throw Error('should have auth')

	const sharedLinkType = fromDerivedComputed(
		'file',
		() => fileId,
		(id) => app.current.getFile(id)?.sharedLinkType
	)

	function handleSelectChange(next: TlaFile['sharedLinkType'] | 'no-access') {
		app.current.setFileSharedLinkType(fileId, next)
		trackEvent('set-shared-link-type', { type: next, source: 'file-share-menu' })
	}
</script>

{#snippet editorLabel()}
	<F defaultMessage="Editor" />
{/snippet}

{#snippet viewerLabel()}
	<F defaultMessage="Viewer" />
{/snippet}

<TlaMenuControl>
	<TlaMenuControlLabel htmlFor="tla-shared-link-type-select">
		<F defaultMessage="Anyone with the link" />
	</TlaMenuControlLabel>
	<TlaMenuSelect
		id="tla-shared-link-type-select"
		data-testid="shared-link-type-select"
		label={msg((sharedLinkType.current === 'edit' ? messages.editor : messages.viewer).id)}
		value={sharedLinkType.current!}
		onChange={handleSelectChange}
		options={[
			{ value: 'edit', label: editorLabel },
			{ value: 'view', label: viewerLabel },
		]}
	/>
</TlaMenuControl>
