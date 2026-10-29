<script lang="ts" module>
	import { SvelteDraw, type Editor, type SvelteDrawOptions, type TLComponents } from 'svelte-draw'
	import { overrides } from '#lib/components/overrides.ts'
	import WorkflowStylePanel from '#lib/components/WorkflowStylePanel.svelte'
	import WorkflowToolbarWithActions from '#lib/components/WorkflowToolbarWithActions.svelte'
	import { ConnectionBindingUtil } from '#lib/connection/ConnectionBindingUtil.ts'
	import { ConnectionCenterHandleOverlayUtil } from '#lib/connection/ConnectionCenterHandleOverlayUtil.ts'
	import { ConnectionShapeUtil } from '#lib/connection/ConnectionShapeUtil.ts'
	import { keepConnectionsAtBottom } from '#lib/connection/keepConnectionsAtBottom.ts'
	import { disableTransparency } from '#lib/disableTransparency.ts'
	import { NodeShapeUtil } from '#lib/nodes/NodeShapeUtil.ts'
	import { PointingPort } from '#lib/ports/PointingPort.ts'

	// Define custom shape utilities that extend svelte-draw's shape system
	const shapeUtils = [NodeShapeUtil, ConnectionShapeUtil]
	// Define binding utilities that handle relationships between shapes
	const bindingUtils = [ConnectionBindingUtil]
	// Canvas overlays: adds the "+" insert handle at the midpoint of each connection
	const overlayUtils = [ConnectionCenterHandleOverlayUtil]

	// Customize svelte-draw's UI components to add workflow-specific functionality. Defined outside
	// the component so they keep the same identity.
	const components: TLComponents = {
		Toolbar: WorkflowToolbarWithActions,
		// `null` removes the menu panel
		MenuPanel: null,
		StylePanel: WorkflowStylePanel,
	}

	const options: Partial<SvelteDrawOptions> = {
		actionShortcutsLocation: 'menu',
		maxPages: 1,
	}

	function onMount(editor: Editor) {
		;(window as any).editor = editor
		if (!editor.getCurrentPageShapes().some((s) => s.type === 'node')) {
			editor.createShape({ type: 'node', x: 200, y: 200 })
		}

		editor.user.updateUserPreferences({ isSnapMode: true })

		// Add our custom pointing port tool to the select tool's state machine
		// This allows users to create connections by pointing at ports
		editor.getStateDescendant('select')!.addChild(PointingPort)

		// todo: move connections to on the canvas layer

		// Ensure connections always stay at the bottom of the shape stack
		// This prevents them from covering other shapes
		keepConnectionsAtBottom(editor)

		// Disable transparency for workflow shapes
		disableTransparency(editor, ['node', 'connection'])
	}
</script>

<div class="workflow" style="position: fixed; inset: 0">
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
