<script lang="ts">
	import type { UIMessage } from 'ai'
	import ChatMessage from './ChatMessage.svelte'
	import type { ImageClickTarget } from './types'

	let {
		messages,
		onImageClick,
	}: { messages: UIMessage[]; onImageClick: (target: ImageClickTarget) => void } = $props()
</script>

<div class="message-list">
	{#each messages as message (message.id)}
		<ChatMessage {message} {onImageClick} />
	{/each}
</div>
