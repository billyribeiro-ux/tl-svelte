<script lang="ts">
	import { fromComputed } from 'svelte-draw'
	import ConfigPanel from '../config-panel/ConfigPanel.svelte'
	import ConfigPanelBooleanControl from '../config-panel/ConfigPanelBooleanControl.svelte'
	import ConfigPanelSlider from '../config-panel/ConfigPanelSlider.svelte'
	import { fluidConfig, resetFluidConfig } from './config'

	/**
	 * Configuration panel for the fluid simulation.
	 * Provides UI controls for adjusting all fluid simulation parameters including:
	 * - General settings (quality, velocity)
	 * - Simulation parameters (resolution, dissipation, pressure)
	 * - Splat settings (radius, force, colors)
	 * - Post-processing effects (bloom, sunrays)
	 */
	const config = fromComputed('config', () => fluidConfig.get())

	function handleChange(prop: string, value: number | boolean) {
		fluidConfig.update((prev) => ({ ...prev, [prop]: value }))
	}
</script>

<ConfigPanel onReset={resetFluidConfig}>
	<!-- General Settings -->
	<ConfigPanelSlider
		prop="quality"
		label="Quality"
		min={0.001}
		max={1}
		value={config.current.quality}
		type="float"
		onChange={handleChange}
	/>
	<ConfigPanelSlider
		prop="velocityScale"
		label="Velocity Scale"
		min={0}
		max={0.1}
		value={config.current.velocityScale}
		type="float"
		onChange={handleChange}
	/>
	<ConfigPanelSlider
		prop="boundsSampleCount"
		label="Bounds Sample Ct."
		min={4}
		max={100}
		value={config.current.boundsSampleCount}
		type="int"
		onChange={handleChange}
	/>
	<ConfigPanelBooleanControl
		prop="paused"
		label="Paused"
		value={config.current.paused}
		onChange={handleChange}
	/>
	<ConfigPanelBooleanControl
		prop="transparent"
		label="Transparent Bg"
		value={config.current.transparent}
		onChange={handleChange}
	/>

	<!-- Simulation Settings -->
	<ConfigPanelSlider
		prop="simResolution"
		label="Sim Quality"
		min={32}
		max={512}
		value={config.current.simResolution}
		type="int"
		onChange={handleChange}
	/>
	<ConfigPanelSlider
		prop="dyeResolution"
		label="Dye Quality"
		min={256}
		max={2048}
		value={config.current.dyeResolution}
		type="int"
		onChange={handleChange}
	/>
	<ConfigPanelSlider
		prop="densityDissipation"
		label="Density Diss."
		min={0}
		max={4}
		value={config.current.densityDissipation}
		type="float"
		onChange={handleChange}
	/>
	<ConfigPanelSlider
		prop="velocityDissipation"
		label="Velocity Diss."
		min={0}
		max={1}
		value={config.current.velocityDissipation}
		type="float"
		onChange={handleChange}
	/>
	<ConfigPanelSlider
		prop="pressure"
		label="Pressure"
		min={0}
		max={2}
		value={config.current.pressure}
		type="float"
		onChange={handleChange}
	/>
	<ConfigPanelSlider
		prop="pressureIterations"
		label="Pressure Iter."
		min={1}
		max={60}
		value={config.current.pressureIterations}
		type="int"
		onChange={handleChange}
	/>
	<ConfigPanelSlider
		prop="curl"
		label="Curl (Vorticity)"
		min={0}
		max={100}
		value={config.current.curl}
		type="int"
		onChange={handleChange}
	/>

	<!-- Splat Settings -->
	<ConfigPanelSlider
		prop="splatRadius"
		label="Splat Radius"
		min={0.01}
		max={1}
		value={config.current.splatRadius}
		type="float"
		onChange={handleChange}
	/>
	<ConfigPanelSlider
		prop="splatForce"
		label="Splat Force"
		min={1000}
		max={20000}
		value={config.current.splatForce}
		type="int"
		onChange={handleChange}
	/>
	<ConfigPanelBooleanControl
		prop="shading"
		label="Shading"
		value={config.current.shading}
		onChange={handleChange}
	/>
	<ConfigPanelBooleanControl
		prop="colorful"
		label="Colorful Mode"
		value={config.current.colorful}
		onChange={handleChange}
	/>
	<ConfigPanelSlider
		prop="colorUpdateSpeed"
		label="Color Speed"
		min={1}
		max={50}
		value={config.current.colorUpdateSpeed}
		type="int"
		onChange={handleChange}
	/>

	<!-- Post-Processing -->
	<ConfigPanelBooleanControl
		prop="bloom"
		label="Bloom Effect"
		value={config.current.bloom}
		onChange={handleChange}
	/>
	<ConfigPanelSlider
		prop="bloomIterations"
		label="Bloom Iter."
		min={1}
		max={20}
		value={config.current.bloomIterations}
		type="int"
		onChange={handleChange}
	/>
	<ConfigPanelSlider
		prop="bloomResolution"
		label="Bloom Res."
		min={64}
		max={512}
		value={config.current.bloomResolution}
		type="int"
		onChange={handleChange}
	/>
	<ConfigPanelSlider
		prop="bloomIntensity"
		label="Bloom Int."
		min={0}
		max={2}
		value={config.current.bloomIntensity}
		type="float"
		onChange={handleChange}
	/>
	<ConfigPanelSlider
		prop="bloomThreshold"
		label="Bloom Thresh."
		min={0}
		max={1}
		value={config.current.bloomThreshold}
		type="float"
		onChange={handleChange}
	/>
	<ConfigPanelSlider
		prop="bloomSoftKnee"
		label="Bloom Soft Knee"
		min={0}
		max={1}
		value={config.current.bloomSoftKnee}
		type="float"
		onChange={handleChange}
	/>

	<ConfigPanelBooleanControl
		prop="sunrays"
		label="Sunrays Effect"
		value={config.current.sunrays}
		onChange={handleChange}
	/>
	<ConfigPanelSlider
		prop="sunraysResolution"
		label="Sunrays Res."
		min={64}
		max={512}
		value={config.current.sunraysResolution}
		type="int"
		onChange={handleChange}
	/>
	<ConfigPanelSlider
		prop="sunraysWeight"
		label="Sunrays Weight"
		min={0}
		max={2}
		value={config.current.sunraysWeight}
		type="float"
		onChange={handleChange}
	/>
</ConfigPanel>
