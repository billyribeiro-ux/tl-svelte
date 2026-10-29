<script lang="ts">
	import { HTMLContainer, getEditor } from '@svelte-draw/svelte'
	import type { TLShapeId } from 'svelte-draw'
	import { nativeEvents } from '../../nativeEvents'
	import { ANIMAL_EMOJIS, MY_EDITABLE_SHAPE_TYPE } from './EditableShapeUtil'

	let { id, isEditing, animal }: { id: TLShapeId; isEditing: boolean; animal: number } = $props()

	const editor = getEditor()

	// [b] Marked as handled on the native event (before the editor's listeners run), only while editing.
	const events = nativeEvents({
		pointerdown: (e) => {
			if (isEditing) editor.markEventAsHandled(e)
		},
	})
</script>

<HTMLContainer
	{id}
	style="pointer-events: {isEditing
		? 'all'
		: 'none'}; background-color: #efefef; font-size: 24px; padding: 16px;"
	{@attach events}
>
	{ANIMAL_EMOJIS[animal]}
	<!-- [c] -->
	{#if isEditing}
		<button
			onclick={() => {
				editor.updateShape({
					id,
					type: MY_EDITABLE_SHAPE_TYPE,
					props: { animal: (animal + 1) % ANIMAL_EMOJIS.length },
				})
			}}
		>
			Next
		</button>
	{:else}
		<!-- [d] when not editing... -->
		<p style="font-size: 12px;">Double click to edit</p>
	{/if}
</HTMLContainer>
