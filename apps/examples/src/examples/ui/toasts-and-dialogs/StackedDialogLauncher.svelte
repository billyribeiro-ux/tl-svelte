<script lang="ts">
	import { getDialogs } from 'svelte-draw'
	import MyNestedDialog from './MyNestedDialog.svelte'

	const { addDialog } = getDialogs()
</script>

<button
	data-testid="show-nested-dialog"
	style="position: absolute; top: 50%; left: 8px; transform: translateY(-50%); pointer-events: all;"
	onclick={() => addDialog({ component: MyNestedDialog })}
>
	Show nested dialog
</button>
