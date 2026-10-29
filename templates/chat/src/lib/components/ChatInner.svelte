<script lang="ts">
	import { DefaultChatTransport, type FileUIPart, type TextUIPart, type UIMessage } from 'ai'
	import { untrack } from 'svelte'
	import { Chat } from '#lib/chat.svelte.ts'
	import { ChatInputState } from '#lib/chatInputState.svelte.ts'
	import { saveChatMessages } from '#lib/chatMessageStorage.ts'
	import { createScrollToBottom } from '#lib/scrollToBottom.ts'
	import { uploadMessageContents } from '#lib/uploadMessageContents.ts'
	import ChatInput from './ChatInput.svelte'
	import ClearChatIcon from './ClearChatIcon.svelte'
	import MessageList from './MessageList.svelte'
	import type { ImageClickTarget, SvelteDrawProviderMetadata, WhiteboardImage } from './types'

	let { initialMessages }: { initialMessages: UIMessage[] } = $props()

	// All state relating to the chat input and the svelte-draw modal is managed in this object
	const chatInputState = new ChatInputState()

	// We use the Vercel AI SDK's framework-agnostic `AbstractChat` (wrapped in ../chat.svelte.ts) to
	// send messages to the server and manage the chat history. You could replace this with your own
	// chat implementation.
	const chat: Chat = new Chat({
		transport: new DefaultChatTransport({
			api: '/api/chat',
			prepareSendMessagesRequest: async (options) => {
				const { messagesToSend, messagesToSave } = await uploadMessageContents(options.messages)
				chat.messages = messagesToSave
				return {
					body: {
						...options.body,
						id: options.id,
						messages: messagesToSend,
						trigger: options.trigger,
						messageId: options.messageId,
					},
				}
			},
		}),
		messages: untrack(() => initialMessages),
	})

	// save the chat messages to local storage when the chat finishes
	$effect(() => {
		if (chat.status === 'ready') {
			saveChatMessages(chat.messages)
		}
	})

	// If the chat encounters an error, we alert the user and clear the error.
	$effect(() => {
		const error = chat.error
		if (error) {
			alert(error.message)
			chat.clearError()
		}
	})

	// when the user send a message, we take the text they've written and any images / sketches
	// they've attached and send them to the model.
	function handleSendMessage(text: string, images: WhiteboardImage[]) {
		chatInputState.clear()

		const parts: (TextUIPart | FileUIPart)[] = images.map((image): FileUIPart => {
			const svelteDrawMetadata: SvelteDrawProviderMetadata = {
				snapshot: image.snapshot,
				imageName: image.name,
			}
			return {
				type: 'file',
				url: image.url,
				filename: image.name,
				mediaType: image.type,
				providerMetadata: { 'svelte-draw': svelteDrawMetadata } as any,
			}
		})

		if (text.trim()) {
			parts.push({ type: 'text', text })
		}

		chat.sendMessage({ parts })
	}

	// keep the chat scrolled to the bottom as messages are added or changed
	const scrollToBottom = createScrollToBottom()
	$effect(() => {
		chat.messages
		scrollToBottom()
	})

	// when the user clicks on an image from chat history, we open the svelte-draw modal. here they can
	// see a larger version of the image, but also annotate it and re-add it to the chat.
	function handleImageClick(opts: ImageClickTarget) {
		chatInputState.openWhiteboardModal(opts)
	}

	function handleClearChat() {
		chat.messages = []
		saveChatMessages([])
	}

	// users can drag and drop images to the chat input area to add them to their message. when
	// they're dragging we keep track of a special isDragging state.
	function handleDragOver(e: DragEvent) {
		e.preventDefault()
		if (
			e.dataTransfer?.types.includes('Files') &&
			!chatInputState.openWhiteboard &&
			!chatInputState.isDragging
		) {
			chatInputState.dragEnter()
		}
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault()
		if (!e.currentTarget || !(e.currentTarget as Node).contains(e.relatedTarget as Node)) {
			chatInputState.dragLeave()
		}
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault()
		const file = e.dataTransfer?.files[0]
		if (file && file.type.startsWith('image/') && !chatInputState.openWhiteboard) {
			chatInputState.drop(file)
		} else {
			chatInputState.dragLeave()
		}
	}
</script>

{#if chat.messages.length === 0}
	<!-- if the chat is empty, we put the input area right in the middle of the page -->
	<div
		class="empty-chat-container"
		role="presentation"
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
	>
		<div class="empty-chat-content">
			<h1 class="empty-chat-title">How can I help?</h1>
			<div class="centered-input">
				<ChatInput
					onSendMessage={handleSendMessage}
					waitingForResponse={chat.status !== 'ready'}
					{scrollToBottom}
					state={chatInputState}
				/>
			</div>
		</div>
	</div>
{:else}
	<!-- otherwise, we show the chat history and the input area at the bottom. -->
	<div
		class="chat-container"
		role="presentation"
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
	>
		<div class="chat-header">
			<button class="icon-button" onclick={handleClearChat} title="Clear chat">
				<ClearChatIcon />
			</button>
		</div>
		<MessageList messages={chat.messages} onImageClick={handleImageClick} />
		<div class="chat-footer">
			<ChatInput
				onSendMessage={handleSendMessage}
				waitingForResponse={chat.status !== 'ready'}
				{scrollToBottom}
				state={chatInputState}
			/>
		</div>
	</div>
{/if}
