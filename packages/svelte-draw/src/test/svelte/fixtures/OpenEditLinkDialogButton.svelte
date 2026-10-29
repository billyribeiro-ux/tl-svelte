<script lang="ts">
	import EditLinkDialog from '../../../lib/ui/components/EditLinkDialog.svelte'
	import { getDialogs } from '../../../lib/ui/context/dialogs'

	const { addDialog } = getDialogs()
</script>

<button data-testid="open-edit-link" onclick={() => addDialog({ component: EditLinkDialog })}>
	open
</button>
