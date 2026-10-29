<script lang="ts" module>
	import type { SvelteDrawOptions, TLComponents } from 'svelte-draw'
	import { overrides } from './components/workflowOverrides'
	import WorkflowInFrontOfTheCanvas from './components/WorkflowInFrontOfTheCanvas.svelte'
	import WorkflowStylePanel from './components/WorkflowStylePanel.svelte'
	import WorkflowToolbarSlot from './components/WorkflowToolbarSlot.svelte'
	import { ConnectionBindingUtil } from './connection/ConnectionBindingUtil'
	import { ConnectionCenterHandleOverlayUtil } from './connection/ConnectionCenterHandleOverlayUtil'
	import { ConnectionShapeUtil } from './connection/ConnectionShapeUtil'
	import { NodeShapeUtil } from './nodes/NodeShapeUtil'

	// Define custom shape utilities that extend svelte-draw's shape system
	const shapeUtils = [NodeShapeUtil, ConnectionShapeUtil]
	// Define binding utilities that handle relationships between shapes
	const bindingUtils = [ConnectionBindingUtil]
	// Canvas overlays — adds the "+" insert handle at the midpoint of each connection
	const overlayUtils = [ConnectionCenterHandleOverlayUtil]

	// Customize svelte-draw's UI components to add workflow-specific functionality
	const components: TLComponents = {
		InFrontOfTheCanvas: WorkflowInFrontOfTheCanvas,
		Toolbar: WorkflowToolbarSlot,
		MenuPanel: null,
		StylePanel: WorkflowStylePanel,
	}

	const options: Partial<SvelteDrawOptions> = {
		actionShortcutsLocation: 'menu',
		maxPages: 1,
	}
</script>

<script lang="ts">
	import { SvelteDraw, type Editor } from 'svelte-draw'
	import { keepConnectionsAtBottom } from './connection/keepConnectionsAtBottom'
	import { disableTransparency } from './disableTransparency'
	import { PointingPort } from './ports/PointingPort'

	function onMount(editor: Editor) {
		;(window as unknown as { editor: Editor }).editor = editor
		if (!editor.getCurrentPageShapes().some((s) => s.type === 'node')) {
			editor.createShape({ type: 'node', x: 200, y: 200 })
		}

		editor.user.updateUserPreferences({ isSnapMode: true })

		// Add our custom pointing port tool to the select tool's state machine
		// This allows users to create connections by pointing at ports
		editor.getStateDescendant('select')!.addChild(PointingPort)

		// Ensure connections always stay at the bottom of the shape stack
		// This prevents them from covering other shapes
		keepConnectionsAtBottom(editor)

		// Disable transparency for workflow shapes
		disableTransparency(editor, ['node', 'connection'])
	}
</script>

<div style="position: fixed; inset: 0">
	<SvelteDraw
		persistenceKey="workflow"
		{options}
		{overrides}
		{shapeUtils}
		{bindingUtils}
		{overlayUtils}
		{components}
		{onMount}
	/>
</div>
