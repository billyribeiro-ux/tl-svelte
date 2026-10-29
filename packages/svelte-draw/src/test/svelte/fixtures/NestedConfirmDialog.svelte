<script lang="ts">
	// A confirm-style dialog opened from inside another dialog (e.g. the dotcom workspace
	// settings dialog's regenerate/leave/delete confirmations).
	let { onClose }: { onClose(): void } = $props()
</script>

<div data-testid="nested-dialog">
	<button data-testid="nested-confirm" onclick={onClose}>Confirm</button>
</div>
