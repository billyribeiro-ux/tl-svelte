<script lang="ts">
	import type { UIMessage } from 'ai'
	import { FileHelpers } from 'svelte-draw'
	import { renderMarkdown } from '#lib/markdown.ts'
	import type { ImageClickTarget, SvelteDrawProviderMetadata } from './types'

	let {
		message,
		onImageClick,
	}: { message: UIMessage; onImageClick: (opts: ImageClickTarget) => void } = $props()

	// For AI messages with no content, show thinking state
	const isThinking = $derived(
		message.role === 'assistant' &&
			!message.parts.some((part) => part.type === 'file' || part.type === 'text')
	)

	async function handleImageClick(part: Extract<UIMessage['parts'][number], { type: 'file' }>) {
		// we stash a snapshot of the svelte-draw document in the provider metadata:
		const svelteDrawMetadata = part.providerMetadata?.['svelte-draw'] as
			| SvelteDrawProviderMetadata
			| undefined
		// if we have a svelte-draw snapshot, we open the svelte-draw modal when it's clicked:
		if (svelteDrawMetadata) {
			onImageClick(svelteDrawMetadata)
		} else {
			const blob = await FileHelpers.urlToBlob(part.url)
			const file = new File([blob], part.filename || 'image.png', { type: blob.type })
			onImageClick({ uploadedFile: file })
		}
	}
</script>

{#if isThinking}
	<div class="message assistant-message thinking-message">
		<div class="thinking-text">Thinking…</div>
	</div>
{:else}
	<div class="message-group {message.role === 'user' ? 'user-message' : 'assistant-message'}">
		{#each message.parts as part, index (index)}
			{#if part.type === 'file'}
				<button
					aria-label="Open image"
					class="message message-image message-image-clickable"
					onclick={() => handleImageClick(part)}
					type="button"
				>
					<img src={part.url} alt="Whiteboard" class="message-image-content" />
				</button>
			{:else if part.type === 'text'}
				<div class="message message-text">
					<!-- renderMarkdown drops raw HTML and sanitizes its output -->
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html renderMarkdown(part.text)}
				</div>
			{/if}
		{/each}
	</div>
{/if}
