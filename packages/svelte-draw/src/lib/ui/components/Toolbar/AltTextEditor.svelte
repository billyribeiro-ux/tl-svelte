<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	import type { TLShapeId } from '@svelte-draw/editor'

	/** @public */
	export interface AltTextEditorProps {
		shapeId: TLShapeId
		onClose(): void
		source: 'image-toolbar' | 'video-toolbar'
	}

	const messages = defineMessages({
		toolMediaAltTextConfirm: { id: 'tool.media-alt-text-confirm', defaultMessage: 'Confirm' },
		toolMediaAltTextDesc: { id: 'tool.media-alt-text-desc', defaultMessage: 'Give a description…' },
	})
</script>

<script lang="ts">
	import { type ExtractShapeByProps, preventDefault, type TLShape } from '@svelte-draw/editor'
	import { getEditor } from '@svelte-draw/svelte'
	import { getUiEvents } from '../../context/events'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiButton from '../primitives/Button/SvelteDrawUiButton.svelte'
	import SvelteDrawUiButtonIcon from '../primitives/Button/SvelteDrawUiButtonIcon.svelte'
	import SvelteDrawUiInput from '../primitives/SvelteDrawUiInput.svelte'

	let { shapeId, onClose, source }: AltTextEditorProps = $props()

	const editor = getEditor()
	// Initial value only: the input owns the text from here on.
	let altText = $state(
		(() => {
			const shape = editor.getShape<TLShape>(shapeId)
			if (!shape) return ''
			if (!('altText' in shape.props)) throw Error('Shape does not have altText property')
			return (shape.props.altText as string) || ''
		})()
	)
	const msg = getTranslation()
	let input = $state<HTMLInputElement | null>(null)
	const trackEvent = getUiEvents()
	const isReadonly = editor.getIsReadonly()

	function handleComplete() {
		trackEvent('set-alt-text', { source })
		const shape = editor.getShape<ExtractShapeByProps<{ altText: string }>>(shapeId)
		if (!shape) return
		editor.markHistoryStoppingPoint('set alt text')
		editor.updateShapes([
			{
				id: shape.id,
				type: shape.type,
				props: { altText },
			},
		])
		onClose()
	}

	$effect(() => {
		const doc = editor.getContainerDocument()
		input?.select()

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				event.stopPropagation()
				onClose()
			}
		}

		doc.addEventListener('keydown', handleKeyDown, { capture: true })
		return () => {
			doc.removeEventListener('keydown', handleKeyDown, { capture: true })
		}
	})

	$effect(() => {
		const doc = editor.getContainerDocument()
		const handlePointerDown = (e: PointerEvent) => {
			const toolbar = doc.querySelector('.tlui-media__toolbar')
			if (toolbar?.contains(e.target as Node)) return
			// If the pointer down is not in the toolbar, complete the alt text
			handleComplete()
		}
		doc.addEventListener('pointerdown', handlePointerDown, { capture: true })

		return () => {
			doc.removeEventListener('pointerdown', handlePointerDown, { capture: true })
		}
	})
</script>

<SvelteDrawUiInput
	bind:ref={input}
	class="tlui-media__toolbar-alt-text-input"
	data-testid="media-toolbar.alt-text-input"
	value={altText}
	placeholder={msg(messages.toolMediaAltTextDesc)}
	aria-label={msg(messages.toolMediaAltTextDesc)}
	onValueChange={(value) => (altText = value)}
	onComplete={handleComplete}
	onCancel={onClose}
	disabled={isReadonly}
/>
{#if !isReadonly}
	<SvelteDrawUiButton
		title={msg(messages.toolMediaAltTextConfirm)}
		data-testid="tool.media-alt-text-confirm"
		type="icon"
		onpointerdown={preventDefault}
		onclick={handleComplete}
	>
		<SvelteDrawUiButtonIcon small icon="check" />
	</SvelteDrawUiButton>
{/if}
