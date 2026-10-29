<script lang="ts" module>
	import { defaultAddFontsFromNode, StateNode, tipTapDefaultExtensions } from 'svelte-draw'

	class InspectTool extends StateNode {
		static override id = 'inspect'
	}

	const tools = [InspectTool]

	const defaultOptions = {
		text: {
			tipTapConfig: {
				extensions: tipTapDefaultExtensions,
			},
			addFontsFromNode: defaultAddFontsFromNode,
		},
	}
</script>

<script lang="ts">
	import { SvelteDrawEditor } from '@svelte-draw/svelte'
	import {
		defaultBindingUtils,
		defaultEditorAssetUrls,
		defaultShapeUtils,
		SvelteDrawUiContextProvider,
		type Editor,
		type TLComponents,
		type TLShape,
	} from 'svelte-draw'

	let { shapes, components = {} }: { shapes: TLShape[]; components?: TLComponents } = $props()

	let editor = $state.raw<Editor | null>(null)
	let isVisible = $state(false)
	let container = $state<HTMLDivElement | null>(null)

	// Hide the component if it's outside of the current scroll area
	$effect(() => {
		if (!container) return
		const observer = new IntersectionObserver(
			([entry]) => {
				isVisible = entry.isIntersecting
			},
			{ rootMargin: '200px', threshold: 0 }
		)

		observer.observe(container)

		return () => {
			observer.unobserve(container!)
		}
	})

	$effect(() => {
		if (!editor || !isVisible) return
		editor.updateInstanceState({ isReadonly: false })
		editor.setCameraOptions({ isLocked: false })
		editor.deleteShapes(editor.getCurrentPageShapes())
		editor.createShapes(shapes)
		editor.updateInstanceState({ isReadonly: true })
		editor.selectAll()
		const bounds = editor.getSelectionPageBounds()
		if (bounds) {
			editor.zoomToBounds(bounds, { inset: 30 })
		}
		editor.selectNone()
		editor.setCameraOptions({ isLocked: true })
	})
</script>

<div bind:this={container} class="svelte-draw-viewer">
	{#if isVisible}
		<SvelteDrawUiContextProvider>
			<SvelteDrawEditor
				autoFocus={false}
				{components}
				onMount={(instance) => {
					editor = instance
					// Drop the reference when the editor unmounts (e.g. scrolled out of view) so the
					// effect above never touches a disposed editor.
					return () => {
						editor = null
					}
				}}
				shapeUtils={defaultShapeUtils}
				bindingUtils={defaultBindingUtils}
				{tools}
				options={defaultOptions}
				assetUrls={defaultEditorAssetUrls}
				initialState="inspect"
			/>
		</SvelteDrawUiContextProvider>
	{/if}
</div>
