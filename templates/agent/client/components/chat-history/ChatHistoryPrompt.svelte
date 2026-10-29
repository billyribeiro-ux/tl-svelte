<script lang="ts">
	import type { Editor } from 'svelte-draw'
	import type { ChatHistoryPromptItem } from '../../../shared/types/ChatHistoryItem'
	import ContextItemTag from '../ContextItemTag.svelte'
	import SelectionTag from '../SelectionTag.svelte'

	let { item, editor }: { item: ChatHistoryPromptItem; editor: Editor } = $props()

	const { contextItems, agentFacingMessage, userFacingMessage, selectedShapes, promptSource } =
		$derived(item)

	const showTags = $derived(selectedShapes.length > 0 || contextItems.length > 0)

	// Display the user-facing message if available, otherwise fall back to the agent-facing message
	const displayMessage = $derived(userFacingMessage ?? agentFacingMessage)

	// Get the CSS class modifier based on the prompt source
	const sourceClass = $derived(`chat-history-prompt-${promptSource}`)
</script>

<div class="chat-history-prompt-container">
	<div class={`chat-history-prompt ${sourceClass}`}>
		{#if showTags}
			<div class="prompt-tags">
				{#if selectedShapes.length > 0}
					<SelectionTag />
				{/if}
				{#each contextItems as contextItem, i ('context-item-' + i)}
					<ContextItemTag {editor} item={contextItem} />
				{/each}
			</div>
		{/if}
		<span class="chat-history-prompt-content">{displayMessage}</span>
	</div>
</div>
