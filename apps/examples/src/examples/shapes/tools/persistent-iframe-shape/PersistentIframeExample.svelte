<script lang="ts">
	import {
		SvelteDraw,
		createTLStore,
		defaultBindingUtils,
		defaultShapeUtils,
		type Editor,
	} from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import {
		PERSISTENT_IFRAME_SHAPE_TYPE,
		PersistentIframeShapeUtil,
	} from './PersistentIframeShapeUtil'

	// There's a guide at the bottom of PersistentIframeShapeUtil.ts!

	const customShapeUtils = [PersistentIframeShapeUtil]

	// [6]
	const store = createTLStore({
		shapeUtils: [...defaultShapeUtils, ...customShapeUtils],
		bindingUtils: defaultBindingUtils,
	})
	let isEditorMounted = $state(true)

	function onMount(editor: Editor) {
		const hasIframeShape = editor
			.getCurrentPageShapes()
			.some((shape) => shape.type === PERSISTENT_IFRAME_SHAPE_TYPE)
		if (!hasIframeShape) {
			editor.createShape({ type: PERSISTENT_IFRAME_SHAPE_TYPE, x: 200, y: 100 })
		}
	}
</script>

<div style="position: absolute; inset: 0; display: flex; flex-direction: column;">
	<div style="padding: 8px;">
		<button onclick={() => (isEditorMounted = !isEditorMounted)}>
			{isEditorMounted ? 'Unmount editor' : 'Mount editor'}
		</button>
	</div>
	<div style="flex: 1; position: relative;">
		{#if isEditorMounted}
			<SvelteDraw {store} shapeUtils={customShapeUtils} {onMount} />
		{:else}
			<div style="padding: 16px;">The editor is unmounted. The iframe is parked.</div>
		{/if}
	</div>
</div>
