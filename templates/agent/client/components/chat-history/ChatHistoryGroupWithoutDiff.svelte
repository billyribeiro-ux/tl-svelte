<script lang="ts">
	import AgentIcon from '../../../shared/icons/AgentIcon.svelte'
	import ChevronDownIcon from '../../../shared/icons/ChevronDownIcon.svelte'
	import ChevronRightIcon from '../../../shared/icons/ChevronRightIcon.svelte'
	import { getAgent } from '../../agent/agentAppContext'
	import Markdown from '../Markdown.svelte'
	import type { ChatHistoryGroup } from './chatHistoryGroups'
	import ChatHistoryItem from './ChatHistoryItem.svelte'
	import { getActionInfo } from './getActionInfo'

	let { group }: { group: ChatHistoryGroup } = $props()

	const agentHolder = getAgent()
	const agent = agentHolder.current
	const items = $derived(group.items)

	const nonEmptyItems = $derived(
		items.filter((item) => {
			const { description } = getActionInfo(item.action, agent)
			return description !== null
		})
	)

	let collapsed = $state(true)

	const complete = $derived(items.every((item) => item.action.complete))

	const summary = $derived.by(() => {
		const time = Math.floor(items.reduce((acc, item) => acc + item.action.time, 0) / 1000)
		if (time === 0) return 'Thought for less than a second'
		if (time === 1) return 'Thought for 1 second'
		return `Thought for ${time} seconds`
	})

	const showContent = $derived(!collapsed || !complete)
</script>

{#if nonEmptyItems.length === 0}
	<!-- nothing to show -->
{:else if nonEmptyItems.length < 2}
	<div class="chat-history-group">
		{#each nonEmptyItems as item, i ('action-' + i)}
			<ChatHistoryItem {item} />
		{/each}
	</div>
{:else}
	<div class="chat-history-group">
		{#if complete}
			<button onclick={() => (collapsed = !collapsed)}>
				<span>
					{#if showContent}
						<ChevronDownIcon />
					{:else}
						<ChevronRightIcon />
					{/if}
				</span>
				{summary}
			</button>
		{/if}
		{#if showContent}
			<div class="agent-actions-container">
				{#each nonEmptyItems as item, i ('action-' + i)}
					{@const info = getActionInfo(item.action, agent)}
					<div class={`agent-action agent-action-type-${item.action._type}`}>
						{#if info.icon}
							<span>
								<AgentIcon type={info.icon} />
							</span>
						{/if}
						<span class="agent-action-description">
							<Markdown source={info.description ?? ''} />
						</span>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}
