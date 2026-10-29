import type { TLEditorSnapshot } from 'svelte-draw'
import type { WhiteboardImage } from './components/types'

export interface OpenWhiteboard {
	snapshot?: TLEditorSnapshot
	id?: string
	uploadedFile?: File
	imageName?: string
}

/**
 * State for the chat input: text, images attached to the message, the whiteboard modal for
 * drawing/editing, and drag and drop interactions.
 */
export class ChatInputState {
	/** The text input value */
	input = $state('')
	/** Whiteboard images attached to the message */
	images = $state.raw<WhiteboardImage[]>([])
	/** The whiteboard modal, when it's open */
	openWhiteboard = $state.raw<OpenWhiteboard | null>(null)
	/** True when a file is being dragged over the input area */
	isDragging = $state(false)

	/** Adds or updates an image in the chat input */
	setImage(image: WhiteboardImage) {
		const exists = this.images.some((img) => img.id === image.id)
		this.images = exists
			? this.images.map((img) => (img.id === image.id ? image : img))
			: [...this.images, image]
	}

	/** Removes an image from the chat input by its ID */
	removeImage(imageId: string) {
		this.images = this.images.filter((img) => img.id !== imageId)
	}

	/** Clears all input data (text, images, modals) */
	clear() {
		this.input = ''
		this.images = []
		this.openWhiteboard = null
		this.isDragging = false
	}

	/** Opens the whiteboard modal for drawing/editing */
	openWhiteboardModal({ snapshot, id, uploadedFile, imageName }: OpenWhiteboard = {}) {
		this.openWhiteboard = { snapshot, id, uploadedFile, imageName }
		this.isDragging = false
	}

	/** Closes the whiteboard modal */
	closeWhiteboard() {
		this.openWhiteboard = null
	}

	/** Indicates a file is being dragged over the input area */
	dragEnter() {
		this.isDragging = true
	}

	/** Indicates the drag operation has left the input area */
	dragLeave() {
		this.isDragging = false
	}

	/** Handles dropping an image file to open in the whiteboard */
	drop(file: File) {
		this.isDragging = false
		this.openWhiteboard = { uploadedFile: file, imageName: file.name }
	}
}
