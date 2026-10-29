import { describe, expect, it } from 'vitest'
import type {
	ChatHistoryActionItem,
	ChatHistoryItem,
	ChatHistoryPromptItem,
} from '../../../shared/types/ChatHistoryItem'
import { getAgentHistorySections } from './chatHistorySections'

function prompt(
	promptSource: ChatHistoryPromptItem['promptSource'],
	id: string
): ChatHistoryPromptItem {
	return {
		type: 'prompt',
		promptSource,
		agentFacingMessage: id,
		userFacingMessage: null,
		contextItems: [],
		selectedShapes: [],
	}
}

function action(id: string): ChatHistoryActionItem {
	return {
		type: 'action',
		action: { _type: 'think', text: id, complete: true, time: 0 },
		diff: { added: {}, updated: {}, removed: {} },
		acceptance: 'pending',
	} as ChatHistoryActionItem
}

describe('getAgentHistorySections', () => {
	it('returns no sections for an empty history', () => {
		expect(getAgentHistorySections([])).toEqual([])
	})

	it('starts a section per user prompt and attaches the following actions to it', () => {
		const items: ChatHistoryItem[] = [
			prompt('user', 'one'),
			action('a'),
			action('b'),
			prompt('user', 'two'),
			action('c'),
		]
		const sections = getAgentHistorySections(items)
		expect(sections).toHaveLength(2)
		expect(sections[0].prompt).toBe(items[0])
		expect(sections[0].items).toEqual([items[1], items[2]])
		expect(sections[1].items).toEqual([items[4]])
	})

	it("filters 'self' prompts out of the UI", () => {
		const items: ChatHistoryItem[] = [
			prompt('user', 'one'),
			prompt('self', 'followup'),
			action('a'),
		]
		const sections = getAgentHistorySections(items)
		expect(sections).toHaveLength(1)
		// the action after the hidden prompt still lands on the last visible section
		expect(sections[0].items).toEqual([items[2]])
	})

	it('drops actions that arrive before any visible prompt', () => {
		expect(getAgentHistorySections([action('orphan')])).toEqual([])
	})
})
