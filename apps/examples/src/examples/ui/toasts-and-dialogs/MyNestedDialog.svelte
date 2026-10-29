<script lang="ts">
	import { getDialogs, type TLUiDialogProps } from 'svelte-draw'
	import MyConfirmDialog from './MyConfirmDialog.svelte'

	let { onClose }: TLUiDialogProps = $props()

	const { addDialog } = getDialogs()
</script>

<div data-testid="dialog-parent" style="padding: 16px;">
	<h2>Parent dialog</h2>
	<p>Opens another dialog on top of itself.</p>
	<button
		data-testid="dialog-parent.open-nested"
		onclick={() => addDialog({ component: MyConfirmDialog })}
	>
		Open nested dialog
	</button>
	<button onclick={onClose}>Close</button>
</div>
