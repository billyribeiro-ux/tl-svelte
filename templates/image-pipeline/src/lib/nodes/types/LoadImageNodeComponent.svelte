<script lang="ts" module>
	/** Read a File as a data URL. */
	function readFileAsDataUrl(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.onload = () => resolve(reader.result as string)
			reader.onerror = () => reject(reader.error)
			reader.readAsDataURL(file)
		})
	}

	/** Open the native file picker for an image file. */
	function selectImageFile(): Promise<File | null> {
		return new Promise((resolve) => {
			const input = document.createElement('input')
			input.type = 'file'
			input.accept = 'image/*'
			input.style.display = 'none'

			const dispose = () => {
				input.removeEventListener('change', onChange)
				input.removeEventListener('cancel', onCancel)
				input.remove()
			}

			const onChange = (event: Event) => {
				const fileList = (event.target as HTMLInputElement).files
				resolve(fileList && fileList.length > 0 ? fileList[0] : null)
				dispose()
			}

			const onCancel = () => {
				resolve(null)
				dispose()
			}

			document.body.appendChild(input)
			input.addEventListener('cancel', onCancel)
			input.addEventListener('change', onChange)
			input.click()
		})
	}
</script>

<script lang="ts">
	import { getEditor, nativeEvents } from 'svelte-draw'
	import type { LoadImageNode } from './LoadImageNode'
	import NodeImage from './NodeImage.svelte'
	import NodeRow from './NodeRow.svelte'
	import { updateNode, type NodeComponentProps } from './shared'

	let { shape, node }: NodeComponentProps<LoadImageNode> = $props()
	const editor = getEditor()
	let isDragOver = $state(false)

	// Native listener: a delegated `onpointerdown` would run after the editor's own listeners.
	const stopPointerDown = nativeEvents({ pointerdown: (e) => e.stopPropagation() })

	async function handleFile(file: File) {
		if (!file.type.startsWith('image/')) return
		const dataUrl = await readFileAsDataUrl(file)
		updateNode<LoadImageNode>(editor, shape, (n) => ({ ...n, imageUrl: dataUrl }))
	}

	async function handleBrowse() {
		const file = await selectImageFile()
		if (file) handleFile(file)
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault()
		e.stopPropagation()
		isDragOver = false
		const file = e.dataTransfer?.files[0]
		if (file) handleFile(file)
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault()
		e.stopPropagation()
		isDragOver = true
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault()
		e.stopPropagation()
		isDragOver = false
	}
</script>

<NodeRow>
	<button class="LoadImageNode-browse" onclick={handleBrowse} {@attach stopPointerDown}>
		{node.imageUrl ? 'Replace...' : 'Browse...'}
	</button>
	{#if node.imageUrl}
		<button
			class="LoadImageNode-clear"
			onclick={() => updateNode<LoadImageNode>(editor, shape, (n) => ({ ...n, imageUrl: null }))}
			{@attach stopPointerDown}
			title="Clear image"
		>
			×
		</button>
	{/if}
</NodeRow>
<!-- Drag events are not delegated by Svelte, so these run natively and can stop propagation. -->
<div
	class={['NodeImagePreview', isDragOver && 'NodeImagePreview_dragover']}
	role="presentation"
	ondrop={handleDrop}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
>
	{#if node.imageUrl}
		<NodeImage src={node.imageUrl} alt="Loaded" />
	{:else}
		<div class="NodeImagePreview-empty">
			<span>{isDragOver ? 'Drop image here' : 'Drop or browse for an image'}</span>
		</div>
	{/if}
</div>
