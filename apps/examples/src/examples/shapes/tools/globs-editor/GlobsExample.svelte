<script lang="ts">
	import {
		type Editor,
		type StateNode,
		SvelteDraw,
		type TLComponents,
		type TLPointerEventInfo,
		type TLShape,
		type TLShapeId,
		type TLUiAssetUrlOverrides,
		type TLUiOverrides,
	} from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import type { GlobBinding } from './GlobBindingUtil'
	import { GlobBindingUtil } from './GlobBindingUtil'
	import type { GlobShape } from './GlobShapeUtil'
	import { GlobShapeUtil } from './GlobShapeUtil'
	import { GlobTool } from './GlobTool/GlobTool'
	import GlobsToolbar from './GlobsToolbar.svelte'
	import { type NodeShape, NodeShapeUtil } from './NodeShapeUtil'

	// There's a guide at the bottom of this file!

	const customAssetUrls: TLUiAssetUrlOverrides = {
		icons: {
			'glob-icon': '/glob-icon.svg',
			'node-icon': '/node-icon.svg',
			'connect-node-icon': '/connect-node.svg',
		},
	}

	// [1]
	const uiOverrides: TLUiOverrides = {
		tools(editor, tools) {
			tools['glob.node'] = {
				id: 'glob.node',
				icon: 'node-icon',
				label: 'Node',
				kbd: 'n',
				meta: { variant: 'node' },
				onSelect: () => {
					editor.setCurrentTool('glob.node')
				},
			}

			tools['glob.connect'] = {
				id: 'glob.connect',
				icon: 'connect-node-icon',
				label: 'Connect nodes',
				kbd: 'c',
				meta: { variant: 'connect' },
				onSelect: () => {
					const selectedShapes = editor.getSelectedShapes()
					const hasNodesSelected =
						selectedShapes.length > 0 &&
						selectedShapes.every((shape) => editor.isShapeOfType<NodeShape>(shape, 'node'))
					if (hasNodesSelected) {
						editor.setCurrentTool('glob.connect')
					}
				},
			}

			return tools
		},
	}

	const components: TLComponents = {
		Toolbar: GlobsToolbar,
	}

	type PointingHandleState = StateNode & {
		info?: TLPointerEventInfo & { target: 'handle' }
	}

	const shapes = [NodeShapeUtil, GlobShapeUtil]
	const tools = [GlobTool]
	const bindings = [GlobBindingUtil]
	const options = {
		spacebarPanning: false,
	}

	function onMount(editor: Editor) {
		
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		{options}
		{onMount}
		shapeUtils={shapes}
		{tools}
		bindingUtils={bindings}
		overrides={uiOverrides}
		assetUrls={customAssetUrls}
		{components}
	/>
</div>

<!--
/*
Introduction:

A small vector editor built from globs, the shape primitive from the paper linked in the
README. A `node` is a circle; a `glob` is a skin stretched between two nodes, attached to them
with `glob` bindings so the glob follows when a node moves, and edited through handles on the
glob shape. See NodeShapeUtil.ts, GlobShapeUtil.ts, GlobBindingUtil.ts, and GlobTool/ for
those pieces; this file wires the tool into the UI.

[1]
The glob tool has two child states, `glob.node` and `glob.connect`. Registering both in the
`tools` override gives them labels, icons, and shortcuts (N and C). Connect only makes sense
with nodes selected, so its `onSelect` checks the selection first.

[2]
(GlobToolWithPopover.svelte) A toolbar item that opens a popover with the two variants, built from `SvelteDrawUiPopover` and
`SvelteDrawUiToolbar`. The main item shows whichever glob state is current so the toolbar
highlights it while active.

[3]
Patching the select tool's `pointing_handle` state so dragging a glob handle starts the drag
immediately, even with modifier keys held (which would otherwise start brushing). This is
reaching into the SDK's internals and is fragile across versions; a custom select tool would be
the sturdier approach, but this is far less code for an example.

[4]
When globs are copied or duplicated, include the nodes they're bound to. Otherwise a pasted
glob has bindings to nodes that don't exist in the paste and gets cleaned up.
*/
-->
