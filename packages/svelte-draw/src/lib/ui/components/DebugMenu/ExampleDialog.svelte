<script lang="ts" module>
	import type { Snippet } from 'svelte'

	/** @public */
	export interface ExampleDialogProps {
		title?: string
		body?: string | Snippet
		cancel?: string
		confirm?: string
		displayDontShowAgain?: boolean
		maxWidth?: string
		onCancel(): void
		onContinue(): void
	}
</script>

<script lang="ts">
	import SvelteDrawUiButton from '../primitives/Button/SvelteDrawUiButton.svelte'
	import SvelteDrawUiButtonCheck from '../primitives/Button/SvelteDrawUiButtonCheck.svelte'
	import SvelteDrawUiButtonLabel from '../primitives/Button/SvelteDrawUiButtonLabel.svelte'
	import SvelteDrawUiDialogBody from '../primitives/SvelteDrawUiDialogBody.svelte'
	import SvelteDrawUiDialogCloseButton from '../primitives/SvelteDrawUiDialogCloseButton.svelte'
	import SvelteDrawUiDialogFooter from '../primitives/SvelteDrawUiDialogFooter.svelte'
	import SvelteDrawUiDialogHeader from '../primitives/SvelteDrawUiDialogHeader.svelte'
	import SvelteDrawUiDialogTitle from '../primitives/SvelteDrawUiDialogTitle.svelte'

	let {
		title = 'title',
		body = 'hello hello hello',
		cancel = 'Cancel',
		confirm = 'Continue',
		displayDontShowAgain = false,
		maxWidth = '350',
		onCancel,
		onContinue,
	}: ExampleDialogProps = $props()

	let dontShowAgain = $state(false)
</script>

<SvelteDrawUiDialogHeader>
	<SvelteDrawUiDialogTitle>{title}</SvelteDrawUiDialogTitle>
	<SvelteDrawUiDialogCloseButton />
</SvelteDrawUiDialogHeader>
<SvelteDrawUiDialogBody style={`max-width: ${maxWidth}`}>
	{#if typeof body === 'string'}
		{body}
	{:else}
		{@render body()}
	{/if}
</SvelteDrawUiDialogBody>
<SvelteDrawUiDialogFooter class="tlui-dialog__footer__actions">
	{#if displayDontShowAgain}
		<SvelteDrawUiButton
			type="normal"
			onclick={() => (dontShowAgain = !dontShowAgain)}
			style="margin-right: auto;"
		>
			<SvelteDrawUiButtonCheck checked={dontShowAgain} />
			<SvelteDrawUiButtonLabel>Don’t show again</SvelteDrawUiButtonLabel>
		</SvelteDrawUiButton>
	{/if}
	<SvelteDrawUiButton type="normal" onclick={onCancel}>
		<SvelteDrawUiButtonLabel>{cancel}</SvelteDrawUiButtonLabel>
	</SvelteDrawUiButton>
	<SvelteDrawUiButton type="primary" onclick={() => onContinue()}>
		<SvelteDrawUiButtonLabel>{confirm}</SvelteDrawUiButtonLabel>
	</SvelteDrawUiButton>
</SvelteDrawUiDialogFooter>
