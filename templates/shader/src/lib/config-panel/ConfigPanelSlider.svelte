<script lang="ts" module>
	const STEPS = 100
</script>

<script lang="ts">
	import { SvelteDrawUiSlider } from 'svelte-draw'
	import ConfigPanelLabel from './ConfigPanelLabel.svelte'

	let {
		prop,
		label,
		min,
		max,
		value,
		onChange,
		type,
	}: {
		prop: string
		label: string
		min: number
		max: number
		value: number
		type: 'float' | 'int'
		onChange: (prop: string, value: number) => void
	} = $props()

	// Map actual value (min to max) to slider value (1 to STEPS)
	const sliderValue = $derived(value != null ? 1 + ((value - min) / (max - min)) * (STEPS - 1) : 1)
</script>

<div class="shader-config-panel__control shader-config-panel__control--slider">
	<ConfigPanelLabel>{label}</ConfigPanelLabel>
	<SvelteDrawUiSlider
		steps={STEPS}
		min={1}
		value={sliderValue}
		label={sliderValue.toFixed(0) + '%'}
		title={label}
		onValueChange={(next) => {
			// Map slider value (1 to STEPS) back to actual value (min to max)
			const actualValue = min + ((next - 1) / (STEPS - 1)) * (max - min)
			onChange(prop, type === 'float' ? actualValue : Math.round(actualValue))
		}}
	/>
</div>
