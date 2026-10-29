<script lang="ts">
	import { getEditor, HTMLContainer, type TLShapeId } from 'svelte-draw'
	import { on } from 'svelte/events'
	import { GLOW_SHAPE_TYPE } from './GlowShapeUtil'

	let { id, preventCulling }: { id: TLShapeId; preventCulling: boolean } = $props()

	const editor = getEditor()

	// Native listener: Svelte delegates `onpointerdown` to the app root, which runs after the editor
	// container's own listeners, too late to stop the select tool from starting a drag.
	const stopPointerDown = (element: HTMLInputElement) =>
		on(element, 'pointerdown', (e) => e.stopPropagation())
</script>

<HTMLContainer class="glow-shape">
	<label>
		<input
			type="checkbox"
			checked={preventCulling}
			onchange={() =>
				editor.updateShape({
					id,
					type: GLOW_SHAPE_TYPE,
					props: { preventCulling: !preventCulling },
				})}
			{@attach stopPointerDown}
		/>
		Prevent culling
	</label>
</HTMLContainer>
