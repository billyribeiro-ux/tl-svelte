<script lang="ts">
	import { getDialogs } from '../../../lib/ui/context/dialogs'
	import DialogWithSelect from './DialogWithSelect.svelte'

	let { preventBackgroundClose }: { preventBackgroundClose?: boolean } = $props()

	const { addDialog } = getDialogs()
</script>

<button
	data-testid="open-dialog"
	onclick={() => addDialog({ component: DialogWithSelect, preventBackgroundClose })}
>
	open
</button>
