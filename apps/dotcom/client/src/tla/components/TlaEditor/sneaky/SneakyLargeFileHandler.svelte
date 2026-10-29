<script lang="ts">
	import { fromComputed, getDialogs, getEditor } from 'svelte-draw'
	import { withDialogProps } from '../../../../utils/withDialogProps'
	import { getSvelteDrawAppUiEvents } from '../../../utils/app-ui-events'
	import RoomSizeDialog from './RoomSizeDialog.svelte'

	// Plain flags, not state: only the effect below reads them, and it also sets them.
	let sizeWarningShown = false
	let sizeLimitShown = false
	const { addDialog } = getDialogs()
	const trackEvent = getSvelteDrawAppUiEvents()
	const editor = getEditor()
	const storageUsedPercentage = fromComputed(
		'storageUsagePercentage',
		() => (editor.getDocumentSettings().meta.storageUsedPercentage ?? 0) as number
	)

	$effect(() => {
		const percentage = storageUsedPercentage.current
		if (!sizeLimitShown && percentage > 90) {
			trackEvent('room-size-limit-dialog-shown', { source: 'dialog' })
			addDialog({ component: withDialogProps(RoomSizeDialog, { kind: 'limit' as const }) })
			sizeLimitShown = true
		} else if (!sizeLimitShown && !sizeWarningShown && percentage > 75) {
			trackEvent('room-size-warning-dialog-shown', { source: 'dialog' })
			addDialog({ component: withDialogProps(RoomSizeDialog, { kind: 'warning' as const }) })
			sizeWarningShown = true
		}
	})
</script>
