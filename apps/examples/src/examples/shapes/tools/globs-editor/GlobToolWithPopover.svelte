<script lang="ts">
	import {
		SvelteDrawUiButtonIcon,
		SvelteDrawUiMenuItem,
		SvelteDrawUiPopover,
		SvelteDrawUiPopoverContent,
		SvelteDrawUiPopoverTrigger,
		SvelteDrawUiToolbar,
		SvelteDrawUiToolbarButton,
		fromComputed,
		getEditor,
		getTools,
		tlmenus,
	} from 'svelte-draw'
	import type { NodeShape } from './NodeShapeUtil'

	// [2]
	const tools = getTools()
	const editor = getEditor()
	let isOpen = $state(false)

	const currentGlobTool = fromComputed('current glob tool', () => {
		const tool = editor.getPath()
		if (tool === 'glob.connect') return 'glob.connect'
		return 'glob.node'
	})

	const hasNodesSelected = fromComputed('has nodes selected', () => {
		const selectedShapes = editor.getSelectedShapes()
		return (
			selectedShapes.length > 0 &&
			selectedShapes.every((shape) => editor.isShapeOfType<NodeShape>(shape, 'node'))
		)
	})

	const isSelected = fromComputed('glob tool selected', () => editor.getPath() === currentGlobTool.current)
	const currentTool = $derived(tools.current[currentGlobTool.current])
	const popoverId = 'glob-tool-popover'

	const handleToolSelect = (id: string) => {
		if (id === 'glob.connect' && !hasNodesSelected.current) return
		editor.setCurrentTool(id)
		tlmenus.deleteOpenMenu(popoverId, editor.contextId)
		isOpen = false
	}
</script>

<SvelteDrawUiPopover id={popoverId} open={isOpen} onOpenChange={(value) => (isOpen = value)}>
	<SvelteDrawUiPopoverTrigger>
		{#snippet child({ props })}
			<SvelteDrawUiToolbarButton title="Glob" type="tool" {...props}>
				<SvelteDrawUiButtonIcon icon="glob-icon" />
			</SvelteDrawUiToolbarButton>
		{/snippet}
	</SvelteDrawUiPopoverTrigger>
	<SvelteDrawUiPopoverContent side="top" align="center">
		<SvelteDrawUiToolbar label="Glob">
			<SvelteDrawUiToolbarButton
				title="Add node"
				type="tool"
				onclick={() => handleToolSelect('glob.node')}
			>
				<SvelteDrawUiButtonIcon icon="node-icon" />
			</SvelteDrawUiToolbarButton>
			<SvelteDrawUiToolbarButton
				title="Connect nodes"
				type="tool"
				onclick={() => handleToolSelect('glob.connect')}
				disabled={!hasNodesSelected.current}
			>
				<SvelteDrawUiButtonIcon icon="connect-node-icon" />
			</SvelteDrawUiToolbarButton>
		</SvelteDrawUiToolbar>
	</SvelteDrawUiPopoverContent>
	{#if currentTool}
		<SvelteDrawUiMenuItem {...currentTool} isSelected={isSelected.current} />
	{/if}
</SvelteDrawUiPopover>
