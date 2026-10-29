<script lang="ts">
	/** Opens the keyboard shortcuts dialog through its action and hands back the dialogs. Tests only. */
	import { getActions } from '../../../lib/ui/context/actions.svelte'
	import { getDialogs, type TLUiDialogsContextType } from '../../../lib/ui/context/dialogs'

	let { onReady }: { onReady(dialogs: TLUiDialogsContextType): void } = $props()

	const dialogs = getDialogs()
	const actions = getActions()

	$effect(() => {
		onReady(dialogs)
		actions['open-kbd-shortcuts'].onSelect('kbd')
	})
</script>
