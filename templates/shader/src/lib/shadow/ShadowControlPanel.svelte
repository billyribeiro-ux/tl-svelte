<script lang="ts">
	import ConfigPanel from '../config-panel/ConfigPanel.svelte'
	import ConfigPanelBooleanControl from '../config-panel/ConfigPanelBooleanControl.svelte'
	import ConfigPanelSlider from '../config-panel/ConfigPanelSlider.svelte'
	import { fromComputed } from 'svelte-draw'
	import { resetShaderConfig, shaderConfig } from './config'

	const SLIDER_CONFIGS: Record<string, { min: number; max: number }> = {
		quality: { min: 0.1, max: 1 },
		shadowContrast: { min: 0, max: 1 },
	}

	const config = fromComputed('config', () => shaderConfig.get())

	function handleChange(prop: string, value: number | boolean) {
		shaderConfig.update((prev) => ({ ...prev, [prop]: value }))
	}
</script>

<ConfigPanel onReset={resetShaderConfig}>
	{#each Object.entries(config.current) as [prop, value] (prop)}
		{#if typeof value === 'number'}
			{@const sliderConfig = SLIDER_CONFIGS[prop] || { min: 0, max: 1 }}
			<ConfigPanelSlider
				{prop}
				label={prop}
				min={sliderConfig.min}
				max={sliderConfig.max}
				{value}
				type="float"
				onChange={handleChange}
			/>
		{:else if typeof value === 'boolean'}
			<ConfigPanelBooleanControl {prop} label={prop} {value} onChange={handleChange} />
		{/if}
	{/each}
</ConfigPanel>
