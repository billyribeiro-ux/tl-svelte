<script lang="ts">
	import { fromComputed } from '@svelte-draw/svelte'
	import type { SvelteDrawAgent } from '../../agent/SvelteDrawAgent'
	import { getAgentHistorySections } from './chatHistorySections'
	import ChatHistorySection from './ChatHistorySection.svelte'

	/*
	Chat history is stored as a list of history items.

	Within the UI, we split this list of items into sections.
	Each section contains a user prompt item, and all the agent's actions that follow it.

	Each section is rendered as a separate component.
	The model's actions are grouped together into collapsible groups if appropriate.


	Here's an example of how the UI might look:

	- Chat history
		- Section
			- Prompt
			- Action group
				- Action
				- Action
			- Action group
				- Action
		- Section
			- Prompt
			- Action group
				- Action

	*/

	let { agent }: { agent: SvelteDrawAgent } = $props()

	const historyItems = fromComputed('chatHistory', () => agent.chat.getHistory())
	const sections = $derived(getAgentHistorySections(historyItems.current))
	const isGenerating = fromComputed('isGenerating', () => agent.requests.isGenerating())

	let historyRef = $state<HTMLDivElement | null>(null)
	let previousScrollDistanceFromBottom = 0

	$effect(() => {
		const items = historyItems.current
		const history = historyRef
		if (!history) return

		// If a new prompt is submitted by the user, scroll to the bottom
		if (items.at(-1)?.type === 'prompt') {
			if (previousScrollDistanceFromBottom <= 0) {
				history.scrollTo(0, history.scrollHeight)
				previousScrollDistanceFromBottom = 0
			}
			return
		}

		// If the user is scrolled to the bottom, keep them there while new actions appear
		if (previousScrollDistanceFromBottom <= 0) {
			const scrollDistanceFromBottom = history.scrollHeight - history.scrollTop - history.clientHeight

			if (scrollDistanceFromBottom > 0) {
				history.scrollTo(0, history.scrollHeight)
			}
		}
	})

	// Keep track of the user's scroll position
	function handleScroll() {
		if (!historyRef) return
		const scrollDistanceFromBottom =
			historyRef.scrollHeight - historyRef.scrollTop - historyRef.clientHeight

		previousScrollDistanceFromBottom = scrollDistanceFromBottom
	}
</script>

<div class="chat-history" bind:this={historyRef} onscroll={handleScroll}>
	{#each sections as section, i ('history-section-' + i)}
		<ChatHistorySection {section} loading={i === sections.length - 1 && isGenerating.current} />
	{/each}
</div>
