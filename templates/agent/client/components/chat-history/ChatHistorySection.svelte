<script lang="ts">
	import SmallSpinner from '../../../shared/icons/SmallSpinner.svelte'
	import { getAgent } from '../../agent/agentAppContext'
	import ChatHistoryGroup from './ChatHistoryGroup.svelte'
	import { getActionHistoryGroups } from './chatHistoryGroups'
	import type { ChatHistorySection } from './chatHistorySections'
	import ChatHistoryPrompt from './ChatHistoryPrompt.svelte'

	let { section, loading }: { section: ChatHistorySection; loading: boolean } = $props()

	const agentHolder = getAgent()
	const agent = agentHolder.current
	const actions = $derived(section.items.filter((item) => item.type === 'action'))
	const groups = $derived(getActionHistoryGroups(actions, agent))
</script>

<div class="chat-history-section">
	<ChatHistoryPrompt item={section.prompt} editor={agent.editor} />
	{#each groups as group, i ('chat-history-group-' + i)}
		<ChatHistoryGroup {group} />
	{/each}
	{#if loading}
		<SmallSpinner />
	{/if}
</div>
