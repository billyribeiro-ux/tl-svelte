import type { Component } from 'svelte'
import FluidConfigPanel from './fluid/FluidConfigPanel.svelte'
import FluidRenderer from './fluid/FluidRenderer.svelte'
import MinimalConfigPanel from './minimal/MinimalConfigPanel.svelte'
import MinimalRenderer from './minimal/MinimalRenderer.svelte'
import RainbowConfigPanel from './rainbow/RainbowConfigPanel.svelte'
import RainbowRenderer from './rainbow/RainbowRenderer.svelte'
import ShadowControlPanel from './shadow/ShadowControlPanel.svelte'
import ShadowRenderer from './shadow/ShadowRenderer.svelte'

export interface ShaderExample {
	label: string
	value: string
	ConfigPanel: Component
	Renderer: Component
}

export const EXAMPLES: ShaderExample[] = [
	{ label: 'Fluid', value: 'fluid', ConfigPanel: FluidConfigPanel, Renderer: FluidRenderer },
	{
		label: 'Rainbow',
		value: 'rainbow',
		ConfigPanel: RainbowConfigPanel,
		Renderer: RainbowRenderer,
	},
	{ label: 'Shadows', value: 'shadows', ConfigPanel: ShadowControlPanel, Renderer: ShadowRenderer },
	{
		label: 'Minimal',
		value: 'minimal',
		ConfigPanel: MinimalConfigPanel,
		Renderer: MinimalRenderer,
	},
]
