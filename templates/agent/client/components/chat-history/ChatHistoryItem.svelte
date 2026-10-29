<script lang="ts">
	import AgentIcon from '../../../shared/icons/AgentIcon.svelte'
	import ChevronDownIcon from '../../../shared/icons/ChevronDownIcon.svelte'
	import ChevronRightIcon from '../../../shared/icons/ChevronRightIcon.svelte'
	import type { ChatHistoryActionItem } from '../../../shared/types/ChatHistoryItem'
	import { getAgent } from '../../agent/agentAppContext'
	import Markdown from '../Markdown.svelte'
	import { getActionInfo } from './getActionInfo'

	let { item }: { item: ChatHistoryActionItem } = $props()

	const agentHolder = getAgent()
	const agent = agentHolder.current
	const action = $derived(item.action)
	const info = $derived(getActionInfo(action, agent))
	const collapsible = $derived(info.summary !== null)
	// Collapsed by default when the item is collapsible; the user's toggle overrides that default
	let collapsedOverride = $state<boolean | null>(null)
	const collapsed = $derived(collapsedOverride ?? collapsible)
</script>

{#if info.description}
	<div class="agent-actions-container">
		{#if action.complete && collapsible}
			<button onclick={() => (collapsedOverride = !collapsed)}>
				<span>
					{#if collapsed}
						<ChevronRightIcon />
					{:else}
						<ChevronDownIcon />
					{/if}
				</span>
				{info.summary}
			</button>
		{/if}

		{#if !collapsed || !action.complete}
			<div class={`agent-action agent-action-type-${action._type}`}>
				{#if info.icon}
					<span>
						<AgentIcon type={info.icon} />
					</span>
				{/if}
				<span class="agent-action-description">
					<Markdown source={info.description} />
				</span>
			</div>
		{/if}
	</div>
{/if}
