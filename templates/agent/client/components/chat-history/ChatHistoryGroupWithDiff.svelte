<script lang="ts">
	import { reverseRecordsDiff, squashRecordDiffs } from 'svelte-draw'
	import AgentIcon from '../../../shared/icons/AgentIcon.svelte'
	import type { ChatHistoryActionItem } from '../../../shared/types/ChatHistoryItem'
	import { getAgent } from '../../agent/agentAppContext'
	import type { ChatHistoryGroup } from './chatHistoryGroups'
	import { getActionInfo } from './getActionInfo'
	import SvelteDrawDiffViewer from './SvelteDrawDiffViewer.svelte'

	let { group }: { group: ChatHistoryGroup } = $props()

	const agentHolder = getAgent()
	const agent = agentHolder.current
	const editor = agent.editor
	const items = $derived(group.items)
	const diff = $derived(squashRecordDiffs(items.map((item) => item.diff)))

	// Accept all changes from this group
	function handleAccept() {
		agent.chat.update((currentChatHistoryItems) => {
			const newItems = [...currentChatHistoryItems]
			for (const item of items) {
				const index = newItems.findIndex((v) => v === item)

				// Mark the item as accepted
				if (index !== -1) {
					newItems[index] = { ...item, acceptance: 'accepted' }
				}

				// Apply the diff if needed
				if (item.acceptance === 'rejected') {
					editor.store.applyDiff(item.diff)
				}
			}
			return newItems
		})
	}

	// Reject all changes from this group
	function handleReject() {
		agent.chat.update((currentChatHistoryItems) => {
			const newItems = [...currentChatHistoryItems]
			for (const item of items) {
				const index = newItems.findIndex((v) => v === item)

				// Mark the item as rejected
				if (index !== -1) {
					newItems[index] = { ...item, acceptance: 'rejected' }
				}

				// Reverse the diff if needed
				if (item.acceptance !== 'rejected') {
					const reverseDiff = reverseRecordsDiff(item.diff)
					editor.store.applyDiff(reverseDiff)
				}
			}
			return newItems
		})
	}

	// Get the acceptance status of the group
	// If all items are accepted, the group is accepted
	// If all items are rejected, the group is rejected
	// Otherwise, the group is pending
	const acceptance = $derived.by<ChatHistoryActionItem['acceptance']>(() => {
		if (items.length === 0) return 'pending'
		const acceptance = items[0].acceptance
		for (let i = 1; i < items.length; i++) {
			if (items[i].acceptance !== acceptance) {
				return 'pending'
			}
		}
		return acceptance
	})

	const steps = $derived(items.map((item) => getActionInfo(item.action, agent)))

	// Skip steps without a description, and consecutive steps that repeat the previous description
	const visibleSteps = $derived.by(() => {
		let previousDescription = ''
		const result: { icon: (typeof steps)[number]['icon']; description: string }[] = []
		for (const step of steps) {
			if (!step.description) continue
			if (step.description === previousDescription) continue
			previousDescription = step.description
			result.push({ icon: step.icon, description: step.description })
		}
		return result
	})
</script>

<div class="chat-history-change">
	<div class="chat-history-change-acceptance">
		<button onclick={handleReject} disabled={acceptance === 'rejected'}>
			{acceptance === 'rejected' ? 'Rejected' : 'Reject'}
		</button>
		<button onclick={handleAccept} disabled={acceptance === 'accepted'}>
			{acceptance === 'accepted' ? 'Accepted' : 'Accept'}
		</button>
	</div>
	<div class="agent-changes">
		{#each visibleSteps as step, i ('intent-' + i)}
			<div class="agent-change">
				{#if step.icon}
					<span class="agent-change-icon">
						<AgentIcon type={step.icon} />
					</span>
				{/if}
				{step.description}
			</div>
		{/each}
	</div>
	<SvelteDrawDiffViewer {diff} />
</div>
