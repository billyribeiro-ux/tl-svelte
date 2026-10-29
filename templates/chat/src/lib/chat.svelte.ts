import { structuredClone } from '@svelte-draw/utils'
import { AbstractChat, type ChatInit, type ChatState, type ChatStatus, type UIMessage } from 'ai'

/**
 * Chat state for the Vercel AI SDK's framework-agnostic `AbstractChat`, backed by Svelte runes so
 * that `chat.messages`, `chat.status` and `chat.error` are reactive. (This is the same job that the
 * `useChat` hook does for React.)
 */
class SvelteChatState<UI_MESSAGE extends UIMessage> implements ChatState<UI_MESSAGE> {
	status = $state<ChatStatus>('ready')
	error = $state.raw<Error | undefined>(undefined)
	// messages are replaced, never mutated, so there's no need for deep reactivity
	messages = $state.raw<UI_MESSAGE[]>([])

	constructor(messages: UI_MESSAGE[] = []) {
		this.messages = messages
	}

	pushMessage = (message: UI_MESSAGE) => {
		this.messages = [...this.messages, this.snapshot(message)]
	}

	popMessage = () => {
		this.messages = this.messages.slice(0, -1)
	}

	replaceMessage = (index: number, message: UI_MESSAGE) => {
		const next = [...this.messages]
		// the AI SDK keeps mutating the message it hands us while streaming, so we store a copy
		next[index] = this.snapshot(message)
		this.messages = next
	}

	snapshot<T>(value: T): T {
		return structuredClone(value)
	}
}

/** A chat whose state is reactive. Create it while a component initialises, or anywhere else. */
export class Chat<UI_MESSAGE extends UIMessage = UIMessage> extends AbstractChat<UI_MESSAGE> {
	constructor({ messages, ...init }: ChatInit<UI_MESSAGE>) {
		super({ ...init, state: new SvelteChatState(messages) })
	}
}
