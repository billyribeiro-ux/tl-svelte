<script lang="ts">
	import type { TLUiDialogProps } from 'svelte-draw'

	let { onClose }: TLUiDialogProps = $props()
</script>

<div data-testid="dialog-nested" style="padding: 16px;">
	<h2>Nested dialog</h2>
	<button data-testid="dialog-nested.confirm" onclick={onClose}>Confirm</button>
</div>
