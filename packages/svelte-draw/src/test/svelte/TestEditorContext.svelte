<script lang="ts">
	/**
	 * Provides the editor, its container and an id scope to the children, like the root editor
	 * component does. Only used by tests.
	 */
	import type { Editor, SvgExportContext } from '@svelte-draw/editor'
	import { setContainer, setEditor, setIdScope, setSvgExportContext } from '@svelte-draw/svelte'
	import type { Snippet } from 'svelte'

	let {
		editor,
		container,
		svgExport,
		idScope = true,
		children,
	}: {
		editor: Editor
		container: HTMLElement
		/** When given, the children render as part of an SVG export. */
		svgExport?: SvgExportContext
		/** Whether to start an id scope. An SVG export tree has none. */
		idScope?: boolean
		children: Snippet
	} = $props()

	// The editor and container are fixed for the lifetime of one test mount.
	// svelte-ignore state_referenced_locally
	setEditor(editor)
	// svelte-ignore state_referenced_locally
	setContainer(container)
	// svelte-ignore state_referenced_locally
	if (idScope) setIdScope()
	// svelte-ignore state_referenced_locally
	if (svgExport) setSvgExportContext(svgExport)
</script>

{@render children()}
