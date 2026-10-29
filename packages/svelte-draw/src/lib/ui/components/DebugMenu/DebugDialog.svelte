<script lang="ts">
	import type { TLUiDialogProps } from '../../context/dialogs'
	import ExampleDialog from './ExampleDialog.svelte'

	// The "Show dialog" debug item passes this as the dialog component: dialogs only receive `onClose`.
	let { onClose }: TLUiDialogProps = $props()
</script>

<ExampleDialog displayDontShowAgain onCancel={() => onClose()} onContinue={() => onClose()} />
