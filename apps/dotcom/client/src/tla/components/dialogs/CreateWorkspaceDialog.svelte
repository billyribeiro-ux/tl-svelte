<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		defaultName: { defaultMessage: 'New workspace' },
		placeholder: { defaultMessage: 'Workspace name' },
	})
</script>

<script lang="ts">
	import { MAX_WORKSPACE_NAME_LENGTH } from '@svelte-draw/dotcom-shared'
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
	import styles from './dialogs.module.css'

	let {
		onClose,
		onCreate,
	}: {
		onClose(): void
		// The dialog closes immediately; failures are the handler's to surface (e.g. a toast).
		onCreate(name: string): void | Promise<void>
	} = $props()

	const msg = getTranslation()
	let workspaceName = $state(msg(messages.defaultName))
	let inputRef = $state<HTMLInputElement | null>(null)

	$effect(() => {
		// This dialog is opened from a dropdown item. Native autoFocus can run
		// before the dropdown finishes closing and restores focus to its trigger.
		const timeout = window.setTimeout(() => {
			inputRef?.focus()
			inputRef?.select()
		}, 0)
		return () => window.clearTimeout(timeout)
	})

	function handleCreate() {
		const trimmedName = workspaceName.trim()
		if (trimmedName) {
			onCreate(trimmedName)
			onClose()
		}
	}
</script>

<SvelteDrawUiDialogHeader>
	<SvelteDrawUiDialogTitle>
		<F defaultMessage="Create a workspace" />
	</SvelteDrawUiDialogTitle>
	<SvelteDrawUiDialogCloseButton />
</SvelteDrawUiDialogHeader>
<SvelteDrawUiDialogBody style="max-width: 350px; padding-top: 0px">
	<div>
		<div class={styles.dialogFieldLabelRow}>
			<label style="display: block">
				<F defaultMessage="Name" />
			</label>
		</div>
		<SvelteDrawUiInput
			bind:ref={inputRef}
			class={styles.dialogInput}
			value={workspaceName}
			onValueChange={(v) => (workspaceName = v)}
			onComplete={handleCreate}
			onCancel={onClose}
			placeholder={msg(messages.placeholder)}
			maxLength={MAX_WORKSPACE_NAME_LENGTH}
			autoFocus
		/>
	</div>
</SvelteDrawUiDialogBody>
<SvelteDrawUiDialogFooter class="tlui-dialog__footer__actions">
	<SvelteDrawUiButton type="normal" onclick={onClose}>
		<F defaultMessage="Cancel" />
	</SvelteDrawUiButton>
	<SvelteDrawUiButton type="primary" onclick={handleCreate}>
		<F defaultMessage="Create workspace" />
	</SvelteDrawUiButton>
</SvelteDrawUiDialogFooter>
