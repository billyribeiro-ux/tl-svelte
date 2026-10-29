<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	const messages = defineMessages({
		cursorChatTypeToChat: { id: 'cursor-chat.type-to-chat', defaultMessage: 'Type to chat…' },
	})
</script>

<script lang="ts">
	import { preventDefault } from '@svelte-draw/editor'
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import { getTranslation } from '../hooks/useTranslation/useTranslation.svelte'
	import { nativeEvents } from '../../shapes/shared/nativeEvents'
	import { positionCursorChatBubble } from './positionCursorChatBubble'

	let { chatMessage, value = $bindable() }: { chatMessage: string; value: string } = $props()

	const editor = getEditor()
	const msg = getTranslation()
	const color = fromComputed('chat input color', () => editor.user.getColor())

	let input = $state<HTMLInputElement | null>(null)
	const placeholder = $derived(chatMessage || msg(messages.cursorChatTypeToChat))

	$effect(() => {
		const elm = input
		if (!elm) return

		const textMeasurement = editor.textMeasure.measureText(value || placeholder, {
			fontFamily: 'inherit',
			fontSize: 12,
			fontWeight: '500',
			fontStyle: 'normal',
			maxWidth: null,
			lineHeight: 1,
			padding: '6px',
		})

		elm.style.setProperty('width', textMeasurement.w + 'px')
	})

	$effect(() => {
		// Focus the input
		const raf = editor.timers.requestAnimationFrame(() => {
			input?.focus()
		})

		return () => {
			cancelAnimationFrame(raf)
		}
	})

	function stopChatting() {
		editor.updateInstanceState({ isChatting: false })
		editor.focus()
	}

	// Update the chat message as the user types
	function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
		const next = e.currentTarget.value
		value = next.slice(0, 64)
		// The bound value may not change (typing past the limit), so write it back to the element.
		e.currentTarget.value = value
		editor.updateInstanceState({ chatMessage: next })
	}

	// Handle some keyboard shortcuts
	function handleKeyDown(e: KeyboardEvent) {
		const elm = input
		if (!elm) return

		// get this from the element so that this handler doesn't depend on value
		const { value: currentValue } = elm

		switch (e.key) {
			case 'Enter': {
				preventDefault(e)
				e.stopPropagation()

				// If the user hasn't typed anything, stop chatting
				if (!currentValue) {
					stopChatting()
					return
				}

				// Otherwise, 'send' the message
				value = ''
				break
			}
			case 'Escape': {
				preventDefault(e)
				e.stopPropagation()
				stopChatting()
				break
			}
		}
	}

	// keydown and paste use native listeners (not delegated attributes) so `stopPropagation()` runs
	// before the editor container's own listeners see the event.
	function handlePaste(e: ClipboardEvent) {
		e.stopPropagation()
	}
</script>

<input
	bind:this={input}
	{@attach positionCursorChatBubble(editor)}
	class="tl-cursor-chat"
	style:background-color={color.current}
	onblur={stopChatting}
	oninput={handleInput}
	{@attach nativeEvents({ keydown: handleKeyDown, paste: handlePaste })}
	{value}
	{placeholder}
	spellcheck={false}
/>
