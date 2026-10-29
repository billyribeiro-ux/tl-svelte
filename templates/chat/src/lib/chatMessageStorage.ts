import { validateUIMessages, type UIMessage } from 'ai'
import { FileHelpers } from 'svelte-draw'

const STORAGE_FILE_NAME = 'chat-messages.json'

/**
 * Load the chat messages stored locally in the browser. We use the origin private file system API to
 * store the messages because it has a higher capacity than localStorage, and is easier to use than
 * IndexedDB. If nothing usable is stored, we start with an empty chat.
 */
export async function loadChatMessages(): Promise<UIMessage[]> {
	try {
		const root = await navigator.storage.getDirectory()
		const file = await root.getFileHandle(STORAGE_FILE_NAME)
		const fileContents = await FileHelpers.blobToText(await file.getFile())
		const messages = JSON.parse(fileContents)
		return await validateUIMessages({ messages })
	} catch (err) {
		console.error('Error loading chat messages from storage', err)
		return []
	}
}

export async function saveChatMessages(messages: UIMessage[]) {
	const root = await navigator.storage.getDirectory()
	const file = await root.getFileHandle(STORAGE_FILE_NAME, { create: true })
	const writable = await file.createWritable({ keepExistingData: false })
	await writable.write(JSON.stringify(messages))
	await writable.close()
}
