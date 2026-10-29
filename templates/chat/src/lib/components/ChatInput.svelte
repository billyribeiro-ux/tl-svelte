<script lang="ts">
	import { DefaultSpinner } from 'svelte-draw'
	import type { ChatInputState } from '#lib/chatInputState.svelte.ts'
	import ChatInputImage from './ChatInputImage.svelte'
	import ImageIcon from './icons/ImageIcon.svelte'
	import SendIcon from './icons/SendIcon.svelte'
	import UploadIcon from './icons/UploadIcon.svelte'
	import WhiteboardIcon from './icons/WhiteboardIcon.svelte'
	import type { WhiteboardImage } from './types'
	import WhiteboardModal from './WhiteboardModal.svelte'

	let {
		onSendMessage,
		waitingForResponse,
		scrollToBottom,
		state: inputState,
	}: {
		onSendMessage: (message: string, images: WhiteboardImage[]) => void
		waitingForResponse: boolean
		scrollToBottom: (behavior?: ScrollBehavior) => void
		state: ChatInputState
	} = $props()

	const disabled = $derived(waitingForResponse || inputState.isDragging)

	let textarea = $state<HTMLTextAreaElement | null>(null)

	// focus the textarea when the input is enabled
	$effect(() => {
		if (!disabled) textarea?.focus()
	})

	// Auto-resize textarea when content changes.
	$effect.pre(() => {
		inputState.input
		if (textarea) {
			// Reset height to auto to get the correct scrollHeight
			textarea.style.height = 'auto'
			// Set height based on scrollHeight
			textarea.style.height = `${textarea.scrollHeight}px`
		}
	})

	// Scroll to bottom when images are added.
	$effect.pre(() => {
		inputState.images
		scrollToBottom('instant')
	})

	// the user can only send a message if the input is not disabled and there are either images or
	// text ready to send
	const canSend = $derived(!disabled && (inputState.images.length > 0 || inputState.input.trim()))

	function send() {
		if (canSend) onSendMessage(inputState.input, inputState.images)
	}

	// when the user submits the form, we send the message.
	function handleSubmit(e: SubmitEvent) {
		e.preventDefault()
		send()
	}

	// when the user presses enter, we send the message.
	function handleKeyDown(e: KeyboardEvent) {
		// Shift+Enter: allow default behavior (insert newline)
		if (e.key !== 'Enter' || e.shiftKey) return
		// Enter: submit form
		e.preventDefault()
		send()
	}

	// when the user clicks the image upload button, we open a file input to allow them to select an
	// image from their device.
	function handleImageUpload() {
		const input = document.createElement('input')
		input.type = 'file'
		input.accept = 'image/*'
		input.onchange = (e: Event) => {
			const file = (e.target as HTMLInputElement).files?.[0]
			if (!file || !file.type.startsWith('image/')) return

			// Open whiteboard with the uploaded file
			inputState.openWhiteboardModal({ uploadedFile: file, imageName: file.name })
		}
		input.click()
	}

	// when the user cancels the whiteboard modal, we close it.
	function handleCancelWhiteboard() {
		inputState.closeWhiteboard()
	}

	// when the user accepts the whiteboard modal, we add the image to the chat input & close it.
	function handleAcceptWhiteboard(image: WhiteboardImage) {
		inputState.closeWhiteboard()
		inputState.setImage(image)
		// Re-focus the input after adding an image
		textarea?.focus()
	}
</script>

<form onsubmit={handleSubmit} class="chat-input-form">
	<!-- if the user is dragging an image over the input area, we show a visual indicator
	hiding the normal input content. -->
	{#if inputState.isDragging}
		<div class="drag-drop-indicator">
			<svg class="outline">
				<!-- we use an svg to draw a dashed outline of the input area. svg allows us
				to control the dash length in a way that for example a normal <div> with a
				border would not. -->
				<rect />
			</svg>
			<UploadIcon />
		</div>
	{/if}

	<!-- if the user has added images to the chat input, we show them above the input. -->
	{#if inputState.images.length > 0}
		<div class="input-images">
			{#each inputState.images as image (image.id)}
				<ChatInputImage
					{image}
					onRemove={() => inputState.removeImage(image.id)}
					onEdit={() => {
						inputState.openWhiteboardModal({
							id: image.id,
							snapshot: image.snapshot,
							imageName: image.name,
						})
					}}
				/>
			{/each}
		</div>
	{/if}

	<!-- the main input is a text area. we resize it automatically to fit its content. -->
	<div class="input-container">
		<textarea
			bind:this={textarea}
			bind:value={inputState.input}
			onkeydown={handleKeyDown}
			placeholder={disabled ? '' : 'Type your message…'}
			class="chat-input"
			{disabled}
			rows={1}
		></textarea>
		{#if waitingForResponse}
			<div class="input-spinner">
				<DefaultSpinner />
			</div>
		{/if}
	</div>

	<!-- below the input we have several controls: -->
	<div class="chat-input-bottom">
		<!-- a button to upload an image -->
		<button
			type="button"
			aria-label="Upload an image"
			title="Upload an image"
			class="icon-button"
			{disabled}
			onclick={handleImageUpload}
		>
			<ImageIcon />
		</button>
		<!-- a button to open the whiteboard modal -->
		<button
			type="button"
			aria-label="Draw a sketch"
			title="Draw a sketch"
			class="icon-button"
			{disabled}
			onclick={() => inputState.openWhiteboardModal()}
		>
			<WhiteboardIcon />
		</button>
		<!-- a button to send the message -->
		<button
			type="submit"
			disabled={!canSend || disabled}
			class="icon-button"
			aria-label="Send message"
			title="Send message"
		>
			<SendIcon />
		</button>
	</div>

	<!-- if the user has opened the whiteboard modal, we show it. -->
	{#if inputState.openWhiteboard}
		<WhiteboardModal
			imageId={inputState.openWhiteboard.id}
			initialSnapshot={inputState.openWhiteboard.snapshot}
			uploadedFile={inputState.openWhiteboard.uploadedFile}
			imageName={inputState.openWhiteboard.imageName}
			onCancel={handleCancelWhiteboard}
			onAccept={handleAcceptWhiteboard}
		/>
	{/if}
</form>
