<script lang="ts">
	/**
	 * Mounts a component inside the editor context (editor, container, id scope). Only used by
	 * tests.
	 */
	import type { Editor, SvgExportContext } from '@svelte-draw/editor'
	import type { Component } from 'svelte'
	import TestEditorContext from './TestEditorContext.svelte'

	let {
		editor,
		container,
		component: Rendered,
		props = {},
		svgExport,
		idScope,
	}: {
		editor: Editor
		container: HTMLElement
		component: Component<any>
		props?: object
		svgExport?: SvgExportContext
		idScope?: boolean
	} = $props()
</script>

<TestEditorContext {editor} {container} {svgExport} {idScope}>
	<Rendered {...props} />
</TestEditorContext>
