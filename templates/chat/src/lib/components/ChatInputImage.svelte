<script lang="ts">
	import XIcon from './icons/XIcon.svelte'
	import type { WhiteboardImage } from './types'

	let {
		image,
		onRemove,
		onEdit,
	}: { image: WhiteboardImage; onRemove: () => void; onEdit: () => void } = $props()
</script>

<div class="input-image">
	<!-- the whole image is a clickable area that opens the whiteboard modal. -->
	<button type="button" class="input-image-edit" onclick={onEdit} aria-label="Edit image">
		<!-- svelte-ignore a11y_img_redundant_alt -->
		<img src={image.url} alt="Uploaded image" class="input-image-preview" />
	</button>
	<!-- a button to remove the image is positioned over the top of it. -->
	<button type="button" class="input-image-remove" onclick={onRemove} aria-label="Remove image">
		<XIcon />
	</button>
</div>
