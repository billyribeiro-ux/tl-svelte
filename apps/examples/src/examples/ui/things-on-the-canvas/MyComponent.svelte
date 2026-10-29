<script lang="ts">
	import { getEditor } from 'svelte-draw'
	import { on } from 'svelte/events'
	import type { Attachment } from 'svelte/attachments'

	// [1]
	let count = $state(0)
	const editor = getEditor()

	// `pointerdown` is delegated by Svelte and would run after the editor's own native listener, so
	// the handler is added natively to be able to mark the event as handled in time.
	const markHandled: Attachment<HTMLElement> = (element) =>
		on(element, 'pointerdown', editor.markEventAsHandled)
</script>

<div
	class="on-the-canvas-card"
	style:top="50px"
	style:left="50px"
	style:background-color="goldenrod"
	{@attach markHandled}
>
	<p>The count is {count}!</p>
	<button onclick={() => count--}>-1</button>
	<p>These components are on the canvas. They will scale with camera zoom like shapes.</p>
</div>
<div
	class="on-the-canvas-card"
	style:top="210px"
	style:left="150px"
	style:background-color="pink"
	{@attach markHandled}
>
	<p>The count is {count}!</p>
	<button onclick={() => count++}>+1</button>
	<p>Create and select a shape to see the in front of the canvas component</p>
</div>
