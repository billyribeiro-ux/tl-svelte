<script lang="ts">
	import {
		Editor,
		type TLAnyBindingUtilConstructor,
		type TLAnyShapeUtilConstructor,
		type TLStateNodeConstructor,
		type TLStore,
	} from '@svelte-draw/editor'
	import { onDestroy } from 'svelte'
	import { setContainer, setEditor } from '../../context/editor'
	import { getEditorComponents } from '../componentsContext'
	import { noAutoFocus } from '../preserveFocus'
	import { useStateAttribute } from '../useStateAttribute.svelte'
	import { useZoomCss } from '../useZoomCss.svelte'

	let {
		container,
		store,
		shapeUtils,
		bindingUtils,
		tools,
		initialState,
		autoFocus,
		onMount,
	}: {
		container: HTMLElement
		store: TLStore
		shapeUtils: readonly TLAnyShapeUtilConstructor[]
		bindingUtils: readonly TLAnyBindingUtilConstructor[]
		tools: readonly TLStateNodeConstructor[]
		initialState?: string
		autoFocus?: boolean
		onMount?: (editor: Editor) => void | (() => void)
	} = $props()

	const components = getEditorComponents()

	function createEditor() {
		const editor = new Editor({
			store,
			shapeUtils,
			bindingUtils,
			tools,
			initialState,
			autoFocus: autoFocus && !noAutoFocus(),
			getContainer: () => container,
		})
		editor.updateViewportScreenBounds(container)
		return editor
	}
	// The harness creates one editor per mount; props are read once on purpose.
	const editor = createEditor()

	// svelte-ignore state_referenced_locally
	setContainer(container)
	setEditor(editor)
	useZoomCss()
	useStateAttribute()

	const teardown = (() => onMount?.(editor))()

	onDestroy(() => {
		teardown?.()
		editor.dispose()
	})
</script>

{#if components.Canvas}
	{@const Canvas = components.Canvas}
	<Canvas />
{/if}
