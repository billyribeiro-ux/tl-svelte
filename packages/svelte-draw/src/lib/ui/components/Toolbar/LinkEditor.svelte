<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	import type { TiptapEditor } from '@svelte-draw/editor'

	/** @public */
	export interface LinkEditorProps {
		textEditor: TiptapEditor
		value: string
		onClose(): void
	}

	const messages = defineMessages({
		toolRichTextLinkRemove: { id: 'tool.rich-text-link-remove', defaultMessage: 'Remove link' },
		toolRichTextLinkVisit: { id: 'tool.rich-text-link-visit', defaultMessage: 'Visit link' },
	})
</script>

<script lang="ts">
	import { openWindow, preventDefault } from '@svelte-draw/editor'
	import { getEditor } from '@svelte-draw/svelte'
	import { getUiEvents } from '../../context/events'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiButton from '../primitives/Button/SvelteDrawUiButton.svelte'
	import SvelteDrawUiButtonIcon from '../primitives/Button/SvelteDrawUiButtonIcon.svelte'
	import SvelteDrawUiInput from '../primitives/SvelteDrawUiInput.svelte'

	let { textEditor, value: initialValue, onClose }: LinkEditorProps = $props()

	const editor = getEditor()
	// Writable derived: typing overrides it, a new `initialValue` resets it.
	let value = $derived(initialValue)
	const msg = getTranslation()
	let input = $state<HTMLInputElement | null>(null)
	const trackEvent = getUiEvents()
	const source = 'rich-text-menu'
	const linkifiedValue = $derived(value.startsWith('http') ? value : `https://${value}`)

	function handleLinkComplete(link: string) {
		trackEvent('rich-text', { operation: 'link-edit', source })
		if (!link.startsWith('http://') && !link.startsWith('https://')) {
			link = `https://${link}`
		}

		textEditor.chain().setLink({ href: link }).run()
		// N.B. We shouldn't focus() on mobile because it causes the
		// Return key to replace the link with a newline :facepalm:
		if (editor.getInstanceState().isCoarsePointer) {
			textEditor.commands.blur()
		} else {
			textEditor.commands.focus()
		}
		onClose()
	}

	function handleVisitLink() {
		trackEvent('rich-text', { operation: 'link-visit', source })
		openWindow(linkifiedValue, '_blank')
		onClose()
	}

	function handleRemoveLink() {
		trackEvent('rich-text', { operation: 'link-remove', source })
		textEditor.chain().unsetLink().focus().run()
		onClose()
	}

	$effect(() => {
		const doc = editor.getContainerDocument()
		const handlePointerDown = (e: PointerEvent) => {
			const toolbar = doc.querySelector('.tlui-rich-text__toolbar')
			if (toolbar?.contains(e.target as Node)) return
			// If the pointer down is not in the toolbar, complete the link
			if (value) {
				handleLinkComplete(value)
			} else {
				handleRemoveLink()
			}
		}
		doc.addEventListener('pointerdown', handlePointerDown, { capture: true })
		return () => {
			doc.removeEventListener('pointerdown', handlePointerDown, { capture: true })
		}
	})

	$effect(() => {
		void value
		input?.focus()
	})
</script>

<SvelteDrawUiInput
	bind:ref={input}
	data-testid="rich-text.link-input"
	class="tlui-rich-text__toolbar-link-input"
	{value}
	onValueChange={(next) => (value = next)}
	onComplete={handleLinkComplete}
	onCancel={onClose}
	placeholder="example.com"
	aria-label="example.com"
/>
<SvelteDrawUiButton
	class="tlui-rich-text__toolbar-link-visit"
	title={msg(messages.toolRichTextLinkVisit)}
	type="icon"
	onpointerdown={preventDefault}
	onclick={handleVisitLink}
	disabled={!value}
>
	<SvelteDrawUiButtonIcon small icon="external-link" />
</SvelteDrawUiButton>
<SvelteDrawUiButton
	class="tlui-rich-text__toolbar-link-remove"
	title={msg(messages.toolRichTextLinkRemove)}
	data-testid="rich-text.link-remove"
	type="icon"
	onpointerdown={preventDefault}
	onclick={handleRemoveLink}
>
	<SvelteDrawUiButtonIcon small icon="trash" />
</SvelteDrawUiButton>
