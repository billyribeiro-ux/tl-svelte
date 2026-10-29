<script lang="ts">
	/** Hands the UI actions object to the test. Tests only. */
	import { getActions, type TLUiActionsContextType } from '../../../lib/ui/context/actions.svelte'

	let { onCapture }: { onCapture(actions: TLUiActionsContextType): void } = $props()

	// Captured once at mount; the actions object is stable with live property reads.
	// svelte-ignore state_referenced_locally
	onCapture(getActions())
</script>
