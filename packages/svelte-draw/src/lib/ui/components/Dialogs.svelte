<script lang="ts">
	import { fromSignal } from '@svelte-draw/svelte'
	import { getDialogs } from '../context/dialogs'
	import SvelteDrawUiDialog from './SvelteDrawUiDialog.svelte'

	/** @public */
	const { dialogs } = getDialogs()
	const dialogsArray = fromSignal(dialogs)
</script>

<!--
	Every stacked dialog stays modal (Bits UI's default). That's what keeps dismiss layer-aware: a
	background press or escape closes only the topmost layer, because the focus-scope stack pauses
	lower dialogs rather than dismissing them. Don't make a lower dialog non-modal to work around
	anything — without a focus scope it dismisses on the focus shift when a nested dialog or select
	opens, collapsing the whole stack.
-->
{#each dialogsArray.current as dialog (dialog.id)}
	<SvelteDrawUiDialog {...dialog} />
{/each}
