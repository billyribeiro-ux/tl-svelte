<script lang="ts">
	import { F, getDialogs } from 'svelte-draw'
	import { withDialogProps } from '../../../utils/withDialogProps'
	import TlaCtaButton from '../TlaCtaButton/TlaCtaButton.svelte'
	import RestoreVersionDialog from './RestoreVersionDialog.svelte'

	let { onRestore }: { onRestore(): Promise<void> } = $props()

	const { addDialog } = getDialogs()
</script>

<TlaCtaButton
	canvas
	style="pointer-events: all; margin: 6px"
	onclick={() => {
		addDialog({ component: withDialogProps(RestoreVersionDialog, { onRestore }) })
	}}
>
	<F defaultMessage="Restore version" />
</TlaCtaButton>
