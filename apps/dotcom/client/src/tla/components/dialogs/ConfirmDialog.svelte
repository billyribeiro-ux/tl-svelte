<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** React took a `ReactNode`; a string, or a snippet taking no arguments. */
	export type ConfirmDialogText = string | Snippet
</script>

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

	let {
		title,
		description,
		confirmLabel,
		cancelLabel,
		confirmType = 'primary',
		onConfirm,
		onClose,
	}: {
		title: ConfirmDialogText
		description: ConfirmDialogText
		confirmLabel: ConfirmDialogText
		cancelLabel: ConfirmDialogText
		confirmType?: 'primary' | 'danger' | 'normal'
		onConfirm(): void | Promise<void>
		onClose(): void
	} = $props()
</script>

{#snippet text(t: ConfirmDialogText)}
	{#if typeof t === 'string'}{t}{:else}{@render t()}{/if}
{/snippet}

<SvelteDrawUiDialogHeader>
	<SvelteDrawUiDialogTitle>{@render text(title)}</SvelteDrawUiDialogTitle>
	<SvelteDrawUiDialogCloseButton />
</SvelteDrawUiDialogHeader>
<SvelteDrawUiDialogBody style="max-width: 300px">
	<p>{@render text(description)}</p>
</SvelteDrawUiDialogBody>
<SvelteDrawUiDialogFooter class="tlui-dialog__footer__actions">
	<SvelteDrawUiButton type="normal" onclick={onClose}>
		<SvelteDrawUiButtonLabel>{@render text(cancelLabel)}</SvelteDrawUiButtonLabel>
	</SvelteDrawUiButton>
	<SvelteDrawUiButton
		type={confirmType}
		onclick={async () => {
			await onConfirm()
			onClose()
		}}
	>
		<SvelteDrawUiButtonLabel>{@render text(confirmLabel)}</SvelteDrawUiButtonLabel>
	</SvelteDrawUiButton>
</SvelteDrawUiDialogFooter>
