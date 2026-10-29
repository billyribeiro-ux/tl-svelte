<script lang="ts">
	import type { UIMessage } from 'ai'
	import { onMount } from 'svelte'
	import { loadChatMessages } from '#lib/chatMessageStorage.ts'
	import ChatInner from './ChatInner.svelte'

	// store chat messages locally in the browser
	let initialMessages = $state.raw<UIMessage[] | null>(null)

	onMount(() => {
		let isCancelled = false
		loadChatMessages().then((messages) => {
			if (!isCancelled) initialMessages = messages
		})
		return () => {
			isCancelled = true
		}
	})
</script>

{#if initialMessages}
	<ChatInner {initialMessages} />
{/if}
