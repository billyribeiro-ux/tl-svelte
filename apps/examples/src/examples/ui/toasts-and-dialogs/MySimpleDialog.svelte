<script lang="ts">
	import type { TLUiDialogProps } from 'svelte-draw'

	let { onClose }: TLUiDialogProps = $props()
</script>

<div style="padding: 16px;">
	<h2>Title</h2>
	<p>Description...</p>
	<button onclick={onClose}>Okay</button>
</div>
