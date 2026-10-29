<script lang="ts">
	import { getDialogs, getToasts } from 'svelte-draw'
	import MyDialog from './MyDialog.svelte'
	import MyDialogWithSelect from './MyDialogWithSelect.svelte'
	import MySimpleDialog from './MySimpleDialog.svelte'

	const { addToast } = getToasts()
	const { addDialog } = getDialogs()
</script>

<div style="padding: 16px; gap: 16px; display: flex; pointer-events: all;">
	<button
		onclick={() => {
			addToast({ title: 'Hello world!', severity: 'success' })
		}}
	>
		Show toast
	</button>
	<button
		onclick={() => {
			addToast({
				title: 'This is a very long toast title that keeps going and going',
				description:
					'Long descriptions and unbroken strings like https://example.com/a/really/long/url/that/cannot/wrap/onto/the/next/line wrap within the toast instead of overflowing.',
				severity: 'info',
			})
		}}
	>
		Show long toast
	</button>
	<button
		data-testid="show-dialog"
		onclick={() => {
			addDialog({
				component: MyDialog,
				onClose: () => addToast({ title: 'Dialog closed', severity: 'info' }),
			})
		}}
	>
		Show dialog
	</button>
	<button
		onclick={() => {
			addDialog({ component: MySimpleDialog })
		}}
	>
		Show simple dialog
	</button>
	<button
		data-testid="show-dialog-with-select"
		onclick={() => {
			addDialog({ component: MyDialogWithSelect })
		}}
	>
		Show dialog with select
	</button>
</div>
