<script lang="ts" module>
	import { DefaultSizeStyle, type TLUiOverrides } from 'svelte-draw'
	import { AgentHighlightOverlayUtil } from './overlays/AgentHighlightOverlayUtil'
	import { TargetAreaTool } from './tools/TargetAreaTool'
	import { TargetShapeTool } from './tools/TargetShapeTool'

	// Customize svelte-draw's styles to play to the agent's strengths
	DefaultSizeStyle.setDefaultValue('s')

	// Custom tools for picking context items
	const tools = [TargetShapeTool, TargetAreaTool]
	const overlayUtils = [AgentHighlightOverlayUtil]
	const overrides: TLUiOverrides = {
		tools: (editor, tools) => {
			return {
				...tools,
				'target-area': {
					id: 'target-area',
					label: 'Pick Area',
					kbd: 'c',
					icon: 'tool-frame',
					onSelect() {
						editor.setCurrentTool('target-area')
					},
				},
				'target-shape': {
					id: 'target-shape',
					label: 'Pick Shape',
					kbd: 's',
					icon: 'tool-frame',
					onSelect() {
						editor.setCurrentTool('target-shape')
					},
				},
			}
		},
	}
</script>

<script lang="ts">
	import { SvelteDraw, SvelteDrawUiToastsProvider, type TLComponents } from 'svelte-draw'
	import { setAgentAppHolder } from './agent/agentAppContext'
	import type { SvelteDrawAgentApp } from './agent/SvelteDrawAgentApp'
	import SvelteDrawAgentAppProvider from './agent/SvelteDrawAgentAppProvider.svelte'
	import ChatPanel from './components/ChatPanel.svelte'
	import ChatPanelFallback from './components/ChatPanelFallback.svelte'
	import CustomHelperButtons from './components/CustomHelperButtons.svelte'

	let app = $state.raw<SvelteDrawAgentApp | null>(null)

	// Components defined in SvelteDraw's `components` prop render inside this component's subtree,
	// so they reach the agent app through context (the holder is null until the editor has mounted).
	setAgentAppHolder({
		get current() {
			return app
		},
	})

	function handleMount(instance: SvelteDrawAgentApp) {
		app = instance
	}

	function handleUnmount() {
		app = null
	}

	const components: TLComponents = { HelperButtons: CustomHelperButtons }
</script>

<SvelteDrawUiToastsProvider>
	<div class="svelte-draw-agent-container">
		<div class="svelte-draw-canvas">
			<SvelteDraw
				persistenceKey="svelte-draw-agent-demo"
				{tools}
				{overlayUtils}
				{overrides}
				{components}
			>
				<SvelteDrawAgentAppProvider onMount={handleMount} onUnmount={handleUnmount} />
			</SvelteDraw>
		</div>
		<svelte:boundary>
			{#if app}
				{#key app}
					<ChatPanel />
				{/key}
			{/if}
			{#snippet failed()}
				<ChatPanelFallback />
			{/snippet}
		</svelte:boundary>
	</div>
</SvelteDrawUiToastsProvider>
