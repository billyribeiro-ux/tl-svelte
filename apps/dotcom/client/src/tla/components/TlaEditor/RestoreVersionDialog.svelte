<script lang="ts">
	import {
		SvelteDrawUiButton,
		SvelteDrawUiButtonLabel,
		SvelteDrawUiDialogBody,
		SvelteDrawUiDialogCloseButton,
		SvelteDrawUiDialogFooter,
		SvelteDrawUiDialogHeader,
		SvelteDrawUiDialogTitle,
	} from 'svelte-draw'

	/**
	 * Confirms, runs and reports a version restore. The React button used `window.confirm` and
	 * `window.alert` for the three steps; this dialog shows the same texts ("Are you sure?", "done",
	 * "Something went wrong!") instead. These are staff-only history pages, so the texts stay
	 * untranslated like the originals.
	 */
	let { onRestore, onClose }: { onRestore(): Promise<void>; onClose(): void } = $props()

	let phase = $state<'confirm' | 'restoring' | 'done' | 'error'>('confirm')

	function handleConfirm() {
		phase = 'restoring'
		onRestore()
			.then(() => {
				phase = 'done'
			})
			.catch((error) => {
				phase = 'error'
				console.error(error)
			})
	}
</script>

<SvelteDrawUiDialogHeader>
	<SvelteDrawUiDialogTitle>Restore version</SvelteDrawUiDialogTitle>
	<SvelteDrawUiDialogCloseButton />
</SvelteDrawUiDialogHeader>
<SvelteDrawUiDialogBody style="max-width: 300px">
	{#if phase === 'confirm'}
		Are you sure?
	{:else if phase === 'restoring'}
		Restoring...
	{:else if phase === 'done'}
		done
	{:else}
		Something went wrong!
	{/if}
</SvelteDrawUiDialogBody>
<SvelteDrawUiDialogFooter class="tlui-dialog__footer__actions">
	{#if phase === 'confirm'}
		<SvelteDrawUiButton type="normal" onclick={onClose}>
			<SvelteDrawUiButtonLabel>Cancel</SvelteDrawUiButtonLabel>
		</SvelteDrawUiButton>
		<SvelteDrawUiButton type="primary" onclick={handleConfirm}>
			<SvelteDrawUiButtonLabel>Restore</SvelteDrawUiButtonLabel>
		</SvelteDrawUiButton>
	{:else if phase !== 'restoring'}
		<SvelteDrawUiButton type="primary" onclick={onClose}>
			<SvelteDrawUiButtonLabel>Close</SvelteDrawUiButtonLabel>
		</SvelteDrawUiButton>
	{/if}
</SvelteDrawUiDialogFooter>
