import { isRecordsDiffEmpty } from 'svelte-draw'
import type { ChatHistoryActionItem } from '../../../shared/types/ChatHistoryItem'
import type { SvelteDrawAgent } from '../../agent/SvelteDrawAgent'
import { getActionInfo } from './getActionInfo'

export interface ChatHistoryGroup {
	items: ChatHistoryActionItem[]
	withDiff: boolean
}

/**
 * Merge adjacent actions into groups where possible.
 */
export function getActionHistoryGroups(
	items: ChatHistoryActionItem[],
	agent: SvelteDrawAgent
): ChatHistoryGroup[] {
	const groups: ChatHistoryGroup[] = []

	for (const item of items) {
		const { description } = getActionInfo(item.action, agent)
		if (description === null) {
			continue
		}

		const group = groups[groups.length - 1]
		if (group && canActionBeGrouped({ item, group, agent })) {
			group.items.push(item)
		} else {
			groups.push({
				items: [item],
				withDiff: !isRecordsDiffEmpty(item.diff) && item.action.complete,
			})
		}
	}

	return groups
}

/**
 * Check if an action can be merged with a group.
 */
export function canActionBeGrouped({
	item,
	group,
	agent,
}: {
	item: ChatHistoryActionItem
	group: ChatHistoryGroup
	agent: SvelteDrawAgent
}) {
	if (!item.action.complete) return false
	if (!group) return false

	const showDiff = !isRecordsDiffEmpty(item.diff)
	if (showDiff !== group.withDiff) return false

	const groupAcceptance = group.items[0]?.acceptance
	if (groupAcceptance !== item.acceptance) return false

	const prevAction = group.items.at(-1)?.action
	if (!prevAction) return false

	const actionInfo = getActionInfo(item.action, agent)
	const prevActionInfo = getActionInfo(prevAction, agent)

	if (actionInfo.canGroup(prevAction) && prevActionInfo.canGroup(item.action)) {
		return true
	}

	return false
}
