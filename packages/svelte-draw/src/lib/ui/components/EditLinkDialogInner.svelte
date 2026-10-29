<script lang="ts" module>
	import { defineMessages, T, type TLShape } from '@svelte-draw/editor'
	import { isShapeWithLink, type TLShapeWithLink } from '../../utils/shapes/shapes'

	// A url can either be invalid, or valid with a protocol, or valid without a protocol.
	// For example, "aol.com" would be valid with a protocol ()
	function validateUrl(url: string) {
		if (T.linkUrl.isValid(url)) {
			return { isValid: true, hasProtocol: true }
		}
		if (T.linkUrl.isValid('https://' + url)) {
			return { isValid: true, hasProtocol: false }
		}
		return { isValid: false, hasProtocol: false }
	}

	function getUrlInputState(url: string) {
		const { isValid, hasProtocol } = validateUrl(url)
		const safe = isValid ? (hasProtocol ? url : 'https://' + url) : 'https://'
		return { actual: url, safe, valid: isValid }
	}

	function assertShapeWithLink(
		shape: TLShape | null | undefined
	): asserts shape is TLShapeWithLink {
		if (!isShapeWithLink(shape)) {
			throw new Error('Shape is not a valid TLShapeWithLink')
		}
	}

	const messages = defineMessages({
		// `SvelteDrawUiInput` takes its label as data, not as an element, so this one can't be an `<F>`.
		url: { id: 'edit-link-dialog.url', defaultMessage: 'URL' },
	})
</script>

<script lang="ts">
	import { getEditor } from '@svelte-draw/svelte'
	import type { TLUiDialogProps } from '../context/dialogs'
	import F from '../context/F.svelte'
	import SvelteDrawUiButton from './primitives/Button/SvelteDrawUiButton.svelte'
	import SvelteDrawUiButtonLabel from './primitives/Button/SvelteDrawUiButtonLabel.svelte'
	import SvelteDrawUiDialogBody from './primitives/SvelteDrawUiDialogBody.svelte'
	import SvelteDrawUiDialogCloseButton from './primitives/SvelteDrawUiDialogCloseButton.svelte'
	import SvelteDrawUiDialogFooter from './primitives/SvelteDrawUiDialogFooter.svelte'
	import SvelteDrawUiDialogHeader from './primitives/SvelteDrawUiDialogHeader.svelte'
	import SvelteDrawUiDialogTitle from './primitives/SvelteDrawUiDialogTitle.svelte'
	import SvelteDrawUiInput from './primitives/SvelteDrawUiInput.svelte'

	let { onClose, selectedShape }: TLUiDialogProps & { selectedShape: TLShapeWithLink } = $props()

	const editor = getEditor()

	let input = $state<HTMLInputElement | null>(null)

	$effect(() => {
		editor.timers.requestAnimationFrame(() => input?.focus())
	})

	// The link as it was when the dialog opened; only the first value is wanted.
	// svelte-ignore state_referenced_locally
	const initialValue = selectedShape.props.url

	// svelte-ignore state_referenced_locally
	const { safe: initialSafeUrl } = getUrlInputState(selectedShape.props.url)
	let urlInputState = $state({ actual: initialSafeUrl, safe: initialSafeUrl, valid: true })

	function handleChange(rawValue: string) {
		// Just auto-correct double https:// from a bad paste.
		const fixedRawValue = rawValue.replace(/https?:\/\/(https?:\/\/)/, '$1')
		urlInputState = getUrlInputState(fixedRawValue)
	}

	function handleClear() {
		const onlySelectedShape = editor.getOnlySelectedShape()
		if (!onlySelectedShape) return
		assertShapeWithLink(onlySelectedShape)
		editor.updateShapes([
			{ id: onlySelectedShape.id, type: onlySelectedShape.type, props: { url: '' } },
		])
		onClose()
	}

	function handleComplete() {
		const onlySelectedShape = editor.getOnlySelectedShape()

		if (!onlySelectedShape) return
		assertShapeWithLink(onlySelectedShape)

		// Here would be a good place to validate the next shape—would setting the empty
		if (onlySelectedShape.props.url !== urlInputState.safe) {
			editor.updateShapes([
				{
					id: onlySelectedShape.id,
					type: onlySelectedShape.type,
					props: { url: urlInputState.safe },
				},
			])
		}
		onClose()
	}

	function handleCancel() {
		onClose()
	}

	// Are we going from a valid state to an invalid state?
	const isRemoving = $derived(initialValue && !urlInputState.valid)
</script>

<SvelteDrawUiDialogHeader>
	<SvelteDrawUiDialogTitle>
		<F defaultMessage="Edit link" id="edit-link-dialog.title" />
	</SvelteDrawUiDialogTitle>
	<SvelteDrawUiDialogCloseButton />
</SvelteDrawUiDialogHeader>
<SvelteDrawUiDialogBody>
	<div class="tlui-edit-link-dialog">
		<SvelteDrawUiInput
			bind:ref={input}
			class="tlui-edit-link-dialog__input"
			label={messages.url.id}
			autoFocus
			autoSelect
			placeholder="https://example.com"
			value={urlInputState.actual}
			onValueChange={handleChange}
			onComplete={handleComplete}
			onCancel={handleCancel}
		/>
		<div>
			{#if urlInputState.valid}
				<F defaultMessage="Links will open in a new tab." id="edit-link-dialog.detail" />
			{:else}
				<F defaultMessage="A link must be a valid URL." id="edit-link-dialog.invalid-url" />
			{/if}
		</div>
	</div>
</SvelteDrawUiDialogBody>
<SvelteDrawUiDialogFooter class="tlui-dialog__footer__actions">
	<SvelteDrawUiButton type="normal" onclick={handleCancel} ontouchend={handleCancel}>
		<SvelteDrawUiButtonLabel>
			<F defaultMessage="Cancel" id="edit-link-dialog.cancel" />
		</SvelteDrawUiButtonLabel>
	</SvelteDrawUiButton>
	{#if isRemoving}
		<SvelteDrawUiButton type="danger" ontouchend={handleClear} onclick={handleClear}>
			<SvelteDrawUiButtonLabel>
				<F defaultMessage="Clear" id="edit-link-dialog.clear" />
			</SvelteDrawUiButtonLabel>
		</SvelteDrawUiButton>
	{:else}
		<SvelteDrawUiButton
			type="primary"
			disabled={!urlInputState.valid}
			ontouchend={handleComplete}
			onclick={handleComplete}
		>
			<SvelteDrawUiButtonLabel>
				<F defaultMessage="Continue" id="edit-link-dialog.save" />
			</SvelteDrawUiButtonLabel>
		</SvelteDrawUiButton>
	{/if}
</SvelteDrawUiDialogFooter>
