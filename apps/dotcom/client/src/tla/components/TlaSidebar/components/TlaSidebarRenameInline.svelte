<script lang="ts">
	import { getApp } from '../../../hooks/useAppState.svelte'
	import { getSvelteDrawAppUiEvents, type TLAppUiEventSource } from '../../../utils/app-ui-events'
	import TlaSidebarInlineInput from './TlaSidebarInlineInput.svelte'

	let {
		fileId,
		onClose,
		source,
		active,
	}: {
		fileId: string
		onClose(): void
		source: TLAppUiEventSource
		active?: boolean
	} = $props()

	const app = getApp()
	const trackEvent = getSvelteDrawAppUiEvents()

	function handleComplete(name: string) {
		// Only update the name if there is a name there to update
		app.current.updateFile(fileId, { name })
		trackEvent('rename-file', { name, source })
		onClose()
	}
</script>

<TlaSidebarInlineInput
	data-testid="tla-sidebar-rename-input"
	defaultValue={app.current.getFileName(fileId)}
	onComplete={handleComplete}
	onCancel={onClose}
	{active}
/>
