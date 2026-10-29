<script lang="ts">
	import {
		SvelteDrawUiButton,
		SvelteDrawUiButtonLabel,
		SvelteDrawUiDialogBody,
		SvelteDrawUiDialogCloseButton,
		SvelteDrawUiDialogFooter,
		SvelteDrawUiDialogHeader,
		SvelteDrawUiDialogTitle,
		type TLUiDialogProps,
	} from 'svelte-draw'

	let { onClose }: TLUiDialogProps = $props()
</script>

<SvelteDrawUiDialogHeader>
	<SvelteDrawUiDialogTitle>Title</SvelteDrawUiDialogTitle>
	<SvelteDrawUiDialogCloseButton />
</SvelteDrawUiDialogHeader>
<SvelteDrawUiDialogBody style="max-width: 350px;">
	<p>
		This dialog body holds a few sentences of text so you can see how longer content behaves.
		Regular prose wraps onto multiple lines within the dialog width.
	</p>
	<p>
		Long unbroken strings, like
		https://example.com/a/really/long/url/that/cannot/wrap/onto/the/next/line, also break instead
		of overflowing or being clipped.
	</p>
</SvelteDrawUiDialogBody>
<SvelteDrawUiDialogFooter class="tlui-dialog__footer__actions">
	<SvelteDrawUiButton type="normal" onclick={onClose}>
		<SvelteDrawUiButtonLabel>Cancel</SvelteDrawUiButtonLabel>
	</SvelteDrawUiButton>
	<SvelteDrawUiButton type="primary" onclick={onClose}>
		<SvelteDrawUiButtonLabel>Continue</SvelteDrawUiButtonLabel>
	</SvelteDrawUiButton>
</SvelteDrawUiDialogFooter>
