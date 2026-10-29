<script lang="ts">
	import { getDialogs } from '../../../lib/ui/context/dialogs'
	import NestedConfirmDialog from './NestedConfirmDialog.svelte'

	let { onClose }: { onClose(): void } = $props()

	const { addDialog } = getDialogs()
</script>

<div data-testid="parent-dialog">
	<button data-testid="open-nested" onclick={() => addDialog({ component: NestedConfirmDialog })}>
		open nested
	</button>
	<button data-testid="parent-close" onclick={onClose}>Close</button>
</div>
