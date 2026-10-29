<script lang="ts">
	import {
		F,
		SvelteDrawUiButton,
		SvelteDrawUiButtonLabel,
		SvelteDrawUiDialogBody,
		SvelteDrawUiDialogCloseButton,
		SvelteDrawUiDialogFooter,
		SvelteDrawUiDialogHeader,
		SvelteDrawUiDialogTitle,
	} from 'svelte-draw'

	let { kind, onClose }: { kind: 'warning' | 'limit'; onClose(): void } = $props()
</script>

<SvelteDrawUiDialogHeader>
	<SvelteDrawUiDialogTitle>
		{#if kind === 'warning'}
			<F defaultMessage="File is getting large" />
		{:else}
			<F defaultMessage="File is full" />
		{/if}
	</SvelteDrawUiDialogTitle>
	<SvelteDrawUiDialogCloseButton />
</SvelteDrawUiDialogHeader>
<SvelteDrawUiDialogBody style="max-width: 350px">
	{#if kind === 'warning'}
		<F
			defaultMessage="This file is approaching its size limit. Consider removing some content or starting a new file."
		/>
	{:else}
		<F
			defaultMessage="This file has reached its size limit and changes might no longer be saved. Remove some content or start a new file."
		/>
	{/if}
</SvelteDrawUiDialogBody>
<SvelteDrawUiDialogFooter class="tlui-dialog__footer__actions">
	<SvelteDrawUiButton type="primary" onclick={onClose}>
		<SvelteDrawUiButtonLabel>
			<F defaultMessage="Got it" />
		</SvelteDrawUiButtonLabel>
	</SvelteDrawUiButton>
</SvelteDrawUiDialogFooter>
