<script lang="ts">
	import { F, getEditor } from 'svelte-draw'
	import { routes } from '../../../../routeDefs'
	import { getApp } from '../../../hooks/useAppState.svelte'
	import { getEditorDeepLink } from '../../../hooks/useDeepLink.svelte'
	import { getSvelteDrawAppUiEvents } from '../../../utils/app-ui-events'
	import { copyTextToClipboard } from '../../../utils/copy'
	import TlaMenuControlGroup from '../../tla-menu/TlaMenuControlGroup.svelte'
	import TlaMenuSection from '../../tla-menu/TlaMenuSection.svelte'
	import { fromDerivedComputed } from '../../../hooks/fromDerivedComputed.svelte'
	import QrCode from '../QrCode.svelte'
	import TlaShareMenuCopyButton from '../TlaShareMenuCopyButton.svelte'
	import TlaSelectSharedLinkType from './TlaSelectSharedLinkType.svelte'
	import TlaSharedToggle from './TlaSharedToggle.svelte'

	let { fileId }: { fileId: string } = $props()

	const app = getApp()
	const editor = getEditor()
	const trackEvent = getSvelteDrawAppUiEvents()
	const url = getEditorDeepLink()

	const isShared = fromDerivedComputed(
		'file',
		() => fileId,
		(id) => app.current.requireFile(id).shared
	)

	const hasAdminRights = fromDerivedComputed(
		'hasFileAdminRights',
		() => fileId,
		(id) => app.current.canUpdateFile(id)
	)

	function handleCopyLinkClick() {
		const fileUrl = routes.tlaFile(fileId, { asUrl: true })
		copyTextToClipboard(editor.createDeepLink({ url: fileUrl }).toString())
		// no toasts please
		trackEvent('copy-share-link', { source: 'file-share-menu' })
	}
</script>

<TlaMenuSection>
	{#if hasAdminRights.current}
		<TlaMenuControlGroup>
			<TlaSharedToggle isShared={isShared.current} {fileId} />
			{#if isShared.current}<TlaSelectSharedLinkType {fileId} />{/if}
		</TlaMenuControlGroup>
	{/if}
	{#if isShared.current}
		<TlaShareMenuCopyButton onClick={handleCopyLinkClick}>
			<F defaultMessage="Copy link" />
		</TlaShareMenuCopyButton>
	{/if}
	{#if isShared.current}<QrCode url={url.current ?? ''} />{/if}
</TlaMenuSection>
