<script lang="ts">
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import { positionCursorChatBubble } from './positionCursorChatBubble'

	let { chatMessage }: { chatMessage: string } = $props()

	const editor = getEditor()
	const color = fromComputed('chat bubble color', () => editor.user.getColor())
</script>

<div
	{@attach positionCursorChatBubble(editor)}
	class="tl-cursor-chat tl-cursor-chat__bubble"
	style:background-color={color.current}
>
	{chatMessage}
</div>
