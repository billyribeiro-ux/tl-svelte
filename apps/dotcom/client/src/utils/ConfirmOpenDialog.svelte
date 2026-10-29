<script lang="ts">
	import {
		SvelteDrawUiButton,
		SvelteDrawUiButtonLabel,
		SvelteDrawUiDialogBody,
		SvelteDrawUiDialogCloseButton,
		SvelteDrawUiDialogFooter,
		SvelteDrawUiDialogHeader,
		SvelteDrawUiDialogTitle,
		getTranslation,
	} from 'svelte-draw'

	// `onCancel` / `onContinue` settle the caller's promise; the dialog then closes itself.
	let {
		onCancel,
		onContinue,
		onClose,
	}: { onCancel(): void; onContinue(): void; onClose(): void } = $props()

	const msg = getTranslation()
</script>

<SvelteDrawUiDialogHeader>
	<SvelteDrawUiDialogTitle>{msg('file-system.confirm-open.title')}</SvelteDrawUiDialogTitle>
	<SvelteDrawUiDialogCloseButton />
</SvelteDrawUiDialogHeader>
<SvelteDrawUiDialogBody style="max-width: 350px">
	{msg('file-system.confirm-open.description')}
</SvelteDrawUiDialogBody>
<SvelteDrawUiDialogFooter class="tlui-dialog__footer__actions">
	<SvelteDrawUiButton
		type="normal"
		onclick={() => {
			onCancel()
			onClose()
		}}
	>
		<SvelteDrawUiButtonLabel>{msg('file-system.confirm-open.cancel')}</SvelteDrawUiButtonLabel>
	</SvelteDrawUiButton>
	<SvelteDrawUiButton
		type="primary"
		onclick={() => {
			onContinue()
			onClose()
		}}
	>
		<SvelteDrawUiButtonLabel>{msg('file-system.confirm-open.open')}</SvelteDrawUiButtonLabel>
	</SvelteDrawUiButton>
</SvelteDrawUiDialogFooter>
