<script lang="ts">
	import { getAgent } from '../agent/agentAppContext'
	import ChatHistory from './chat-history/ChatHistory.svelte'
	import ChatInput from './ChatInput.svelte'
	import TodoList from './TodoList.svelte'

	const agentHolder = getAgent()
	// `agent` is stable for this component's lifetime: the parent re-creates ChatPanel per app.
	const agent = agentHolder.current

	let inputRef = $state<HTMLTextAreaElement | null>(null)

	function handleSubmit(e: SubmitEvent & { currentTarget: HTMLFormElement }) {
		e.preventDefault()
		if (!inputRef) return
		const formData = new FormData(e.currentTarget)
		const value = formData.get('input') as string

		// If the user's message is empty, just cancel the current request (if there is one)
		if (value === '') {
			agent.cancel()
			return
		}

		// Clear the chat input (context is cleared after it's captured in requestAgentActions)
		inputRef.value = ''

		// Sending a new message to the agent should interrupt the current request
		agent.interrupt({
			input: {
				agentMessages: [value],
				bounds: agent.editor.getViewportPageBounds(),
				source: 'user',
				contextItems: agent.context.getItems(),
			},
		})
	}

	function handleNewChat() {
		agent.reset()
	}
</script>

<div class="chat-panel tl-theme__dark">
	<div class="chat-header">
		<button class="new-chat-button" onclick={handleNewChat}> + </button>
	</div>
	<ChatHistory {agent} />
	<div class="chat-input-container">
		<TodoList {agent} />
		<ChatInput {agent} {handleSubmit} bind:inputRef />
	</div>
</div>
