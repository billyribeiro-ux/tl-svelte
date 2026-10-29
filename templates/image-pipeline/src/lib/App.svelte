<script lang="ts">
	import { SvelteDraw, type Editor, type SvelteDrawOptions, type TLComponents } from 'svelte-draw'
	import ImagePipelineSidebar from './components/ImagePipelineSidebar.svelte'
	import PipelineInFrontOfTheCanvas from './components/PipelineInFrontOfTheCanvas.svelte'
	import PipelineToolbar from './components/PipelineToolbar.svelte'
	import { overrides } from './components/pipelineOverrides'
	import { ConnectionBindingUtil } from './connection/ConnectionBindingUtil'
	import { ConnectionCenterHandleOverlayUtil } from './connection/ConnectionCenterHandleOverlayUtil'
	import { ConnectionShapeUtil } from './connection/ConnectionShapeUtil'
	import { keepConnectionsAtBottom } from './connection/keepConnectionsAtBottom'
	import { createDefaultPipeline } from './createDefaultPipeline'
	import { disableTransparency } from './disableTransparency'
	import { NodeShapeUtil } from './nodes/NodeShapeUtil'
	import { PointingPort } from './ports/PointingPort'

	const shapeUtils = [NodeShapeUtil, ConnectionShapeUtil]
	const bindingUtils = [ConnectionBindingUtil]
	const overlayUtils = [ConnectionCenterHandleOverlayUtil]

	const components: TLComponents = {
		InFrontOfTheCanvas: PipelineInFrontOfTheCanvas,
		Toolbar: PipelineToolbar,
	}

	const options: Partial<SvelteDrawOptions> = {
		actionShortcutsLocation: 'menu',
		maxPages: 1,
	}

	let editor = $state.raw<Editor | null>(null)
</script>

<div class="image-pipeline-layout" style="position: fixed; inset: 0">
	<div class="image-pipeline-sidebar">
		{#if editor}
			<ImagePipelineSidebar {editor} />
		{:else}
			<div></div>
		{/if}
	</div>
	<div class="image-pipeline-canvas">
		<SvelteDraw
			persistenceKey="image-pipeline"
			{options}
			{overrides}
			{shapeUtils}
			{bindingUtils}
			{overlayUtils}
			{components}
			onMount={(mountedEditor) => {
				;(window as any).editor = mountedEditor

				editor = mountedEditor

				// Create a default pipeline if the canvas is empty
				if (!mountedEditor.getCurrentPageShapes().some((s) => s.type === 'node')) {
					createDefaultPipeline(mountedEditor)
				}

				mountedEditor.user.updateUserPreferences({ isSnapMode: true })

				mountedEditor.getStateDescendant('select')!.addChild(PointingPort)

				keepConnectionsAtBottom(mountedEditor)

				disableTransparency(mountedEditor, ['connection'])
			}}
		/>
	</div>
</div>
