<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		renameFile: { defaultMessage: 'Rename file' },
	})
</script>

<script lang="ts">
	import {
		F,
		getTranslation,
		SvelteDrawUiButton,
		SvelteDrawUiDialogBody,
		SvelteDrawUiDialogCloseButton,
		SvelteDrawUiDialogFooter,
		SvelteDrawUiDialogHeader,
		SvelteDrawUiDialogTitle,
		SvelteDrawUiInput,
	} from 'svelte-draw'

	/**
	 * Renames a file on touch devices. The React top-left panel used `window.prompt` for this; a
	 * styled dialog replaces it (same title, same default value, empty or whitespace-only input
	 * renames nothing).
	 */
	let {
		fileName,
		onSubmit,
		onClose,
	}: {
		fileName: string
		onSubmit(name: string): void
		onClose(): void
	} = $props()

	const msg = getTranslation()
	// svelte-ignore state_referenced_locally
	let value = $state(fileName)

	function handleRename() {
		const newName = value.trim()
		if (newName) onSubmit(newName)
		onClose()
	}
</script>

<SvelteDrawUiDialogHeader>
	<SvelteDrawUiDialogTitle>{msg(messages.renameFile)}</SvelteDrawUiDialogTitle>
	<SvelteDrawUiDialogCloseButton />
</SvelteDrawUiDialogHeader>
<SvelteDrawUiDialogBody>
	<SvelteDrawUiInput
		defaultValue={fileName}
		onValueChange={(next) => (value = next)}
		onComplete={handleRename}
		onCancel={onClose}
		autoFocus
		autoSelect
		aria-label={msg(messages.renameFile)}
		data-testid="tla-top-left-rename-dialog-input"
	/>
</SvelteDrawUiDialogBody>
<SvelteDrawUiDialogFooter class="tlui-dialog__footer__actions">
	<SvelteDrawUiButton type="normal" onclick={onClose}>
		<F defaultMessage="Cancel" />
	</SvelteDrawUiButton>
	<SvelteDrawUiButton type="primary" onclick={handleRename}>
		<F defaultMessage="Rename" />
	</SvelteDrawUiButton>
</SvelteDrawUiDialogFooter>
