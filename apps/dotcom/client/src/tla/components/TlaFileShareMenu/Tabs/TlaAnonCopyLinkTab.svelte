<script lang="ts">
	import { F, getEditor } from 'svelte-draw'
	import { getEditorDeepLink } from '../../../hooks/useDeepLink.svelte'
	import { getSvelteDrawAppUiEvents } from '../../../utils/app-ui-events'
	import { copyTextToClipboard } from '../../../utils/copy'
	import TlaMenuSection from '../../tla-menu/TlaMenuSection.svelte'
	import QrCode from '../QrCode.svelte'
	import TlaShareMenuCopyButton from '../TlaShareMenuCopyButton.svelte'

	const deepLink = getEditorDeepLink()
	const url = $derived(deepLink.current ?? '')

	const editor = getEditor()
	const trackEvent = getSvelteDrawAppUiEvents()

	function handleCopyLinkClick() {
		copyTextToClipboard(editor.createDeepLink({ url }).toString())
		// no toasts please
		trackEvent('copy-share-link', { source: 'file-share-menu' })
	}
</script>

<TlaMenuSection>
	<TlaShareMenuCopyButton onClick={handleCopyLinkClick}>
		<F defaultMessage="Copy link" />
	</TlaShareMenuCopyButton>
	<QrCode {url} />
</TlaMenuSection>
