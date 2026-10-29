<script lang="ts">
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import CursorChatInput from './CursorChatInput.svelte'
	import NotEditingChatMessage from './NotEditingChatMessage.svelte'

	// todo:
	// - not cleaning up
	const CHAT_MESSAGE_TIMEOUT_CLOSING = 2000
	const CHAT_MESSAGE_TIMEOUT_CHATTING = 5000

	/** @public */
	const editor = getEditor()
	const isChatting = fromComputed('is chatting', () => editor.getInstanceState().isChatting)
	const chatMessage = fromComputed('chat message', () => editor.getInstanceState().chatMessage)

	let value = $state('')

	$effect(() => {
		if (!isChatting.current && !chatMessage.current) return undefined

		const duration = isChatting.current
			? CHAT_MESSAGE_TIMEOUT_CHATTING
			: CHAT_MESSAGE_TIMEOUT_CLOSING
		const timeout = editor.timers.setTimeout(() => {
			editor.updateInstanceState({ chatMessage: '', isChatting: false })
			value = ''
			editor.focus()
		}, duration)

		return () => {
			clearTimeout(timeout)
		}
	})
</script>

{#if isChatting.current}
	<CursorChatInput bind:value chatMessage={chatMessage.current} />
{:else if chatMessage.current.trim()}
	<NotEditingChatMessage chatMessage={chatMessage.current} />
{/if}
