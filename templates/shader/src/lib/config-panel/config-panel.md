# Config Panel

A collapsible, reusable configuration panel component for building interactive controls for shader templates. The config panel provides a consistent UI for adjusting shader parameters in real-time.

The config panel system consists of:

- **ConfigPanel**: Container component with collapse/expand functionality and reset button
- **ConfigPanelSlider**: Slider control for numeric values (int or float)
- **ConfigPanelBooleanControl**: Checkbox control for boolean values
- **ConfigPanelLabel**: Text label component

All controls are styled to match the svelte-draw UI and automatically handle state persistence.

## ConfigPanel Component

The main container component that wraps all configuration controls.

### Props

- `children`: a Svelte snippet containing the control components
- `onReset`: Callback function to reset configuration to defaults

### Features

- **Collapsible**: Click the mixer icon to expand/collapse the panel
- **Persistent State**: Panel expanded/collapsed state is saved to localStorage
- **Reset Button**: Visible when expanded, calls the `onReset` callback
- **Scroll Prevention**: Prevents wheel events from affecting the canvas behind it

### Usage

```svelte
<script lang="ts">
	import ConfigPanel from '../config-panel/ConfigPanel.svelte'
	import { resetMyConfig } from './config'
</script>

<ConfigPanel onReset={resetMyConfig}>
	<!-- Add controls here -->
</ConfigPanel>
```

## ConfigPanelSlider

A slider control for numeric values with automatic range mapping.

### Props

- `prop`: Property name (passed to onChange)
- `label`: Display label for the slider
- `min`: Minimum value
- `max`: Maximum value
- `value`: Current value
- `type`: Either `'float'` or `'int'`
- `onChange`: Callback `(prop: string, value: number) => void`

### Features

- Automatically maps between slider steps (1-100) and actual value range
- Rounds to integers when `type='int'`
- Uses svelte-draw's built-in `SvelteDrawUiSlider` component

### Usage

```svelte
<ConfigPanelSlider
	prop="splatRadius"
	label="Splat Radius"
	min={0.01}
	max={1}
	value={config.current.splatRadius}
	type="float"
	onChange={handleChange}
/>
```

## ConfigPanelBooleanControl

A checkbox control for boolean values.

### Props

- `prop`: Property name (passed to onChange)
- `label`: Display label for the checkbox
- `value`: Current boolean value
- `onChange`: Callback `(prop: string, value: boolean) => void`

### Usage

```svelte
<ConfigPanelBooleanControl
	prop="paused"
	label="Paused"
	value={config.current.paused}
	onChange={handleChange}
/>
```

## Reactive Configuration Pattern

The config panel works with svelte-draw's reactive `atom` system for automatic state management and persistence.

### Setting Up Config

```typescript
import { atom, react } from 'svelte-draw'

// 1. Define default configuration
const DEFAULT_CONFIG = {
	quality: 0.5,
	paused: false,
	// ... other properties
}

// 2. Load from localStorage with fallback
const STORAGE_KEY = 'my-shader-config'
let initialValue = DEFAULT_CONFIG

try {
	const value = localStorage.getItem(STORAGE_KEY)
	if (value) initialValue = JSON.parse(value)
} catch {
	// Use defaults if parse fails
}

// 3. Create reactive atom
export const myConfig = atom('my-config', initialValue)

// 4. Reset function
export function resetMyConfig() {
	myConfig.set(DEFAULT_CONFIG)
}

// 5. Auto-save to localStorage
react('save to local storage', () => {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(myConfig.get()))
})
```

### Using Config in Component

```svelte
<script lang="ts">
	import { fromComputed } from 'svelte-draw'
	import ConfigPanel from '../config-panel/ConfigPanel.svelte'
	import ConfigPanelBooleanControl from '../config-panel/ConfigPanelBooleanControl.svelte'
	import ConfigPanelSlider from '../config-panel/ConfigPanelSlider.svelte'
	import { myConfig, resetMyConfig } from './config'

	// Atoms are not tracked by Svelte: bridge the config so the template updates when it changes
	const config = fromComputed('config', () => myConfig.get())

	// Update config properties
	function handleChange(prop: string, value: number | boolean) {
		myConfig.update((prev) => ({ ...prev, [prop]: value }))
	}
</script>

<ConfigPanel onReset={resetMyConfig}>
	<ConfigPanelSlider
		prop="quality"
		label="Quality"
		min={0}
		max={1}
		value={config.current.quality}
		type="float"
		onChange={handleChange}
	/>
	<ConfigPanelBooleanControl
		prop="paused"
		label="Paused"
		value={config.current.paused}
		onChange={handleChange}
	/>
</ConfigPanel>
```

## Styling

The config panel uses CSS classes that can be customized:

- `.shader-config-panel`: Main panel container
- `.shader-config-panel--expanded`: Applied when expanded
- `.shader-config-panel--collapsed`: Applied when collapsed
- `.shader-config-panel__header`: Header with reset and toggle buttons
- `.shader-config-panel__content`: Content area (only visible when expanded)
- `.shader-config-panel__control`: Base class for individual controls
- `.shader-config-panel__control--slider`: Modifier for slider controls
- `.shader-config-panel__control--boolean`: Modifier for boolean controls
- `.shader-config-panel__boolean-input`: Checkbox input element
- `.shader-config-panel__label`: Label text for controls

## Integration with Shader Manager

The config panel is typically placed in the svelte-draw component tree and accessed by a shader manager:

```svelte
<!-- MyShaderRenderer.svelte -->
<script lang="ts">
	import { getEditor } from 'svelte-draw'
	import { MyShaderManager } from './MyShaderManager'
	import { myConfig } from './config'

	const editor = getEditor()
	let canvas = $state<HTMLCanvasElement | null>(null)

	$effect(() => {
		if (!canvas) return
		// Initialize shader with reactive config
		const manager = new MyShaderManager(canvas, editor, myConfig)
		return () => manager.dispose()
	})
</script>

<canvas bind:this={canvas} class="shader-app__canvas"></canvas>
```

Register it as the `Background` component and the config panel inside a custom `StylePanel`, as `src/lib/App.svelte` and `src/lib/ShaderStylePanel.svelte` do:

```svelte
<SvelteDraw components={{ Background: MyShaderRenderer, StylePanel: MyStylePanel }} />
```

## Best Practices

1. **Group Related Controls**: Organize controls by category (e.g., "General Settings", "Simulation Settings", "Visual Effects")
2. **Sensible Ranges**: Choose min/max values that provide useful adjustment without breaking the effect
3. **Clear Labels**: Use concise, descriptive labels (abbreviate if needed to fit the UI)
4. **Reasonable Defaults**: Set defaults that work well out of the box
5. **Persist State**: Always use the reactive atom pattern with localStorage persistence
6. **Type Safety**: Define TypeScript interfaces for your config objects
7. **Reset Function**: Always provide a reset function for returning to defaults

## Example: Complete Config Panel Setup

See `templates/shader/src/lib/fluid/` for a full example implementing:

- `config.ts`: Reactive atom with localStorage persistence
- `FluidConfigPanel.svelte`: Complete configuration UI with 20+ controls
- `FluidManager.ts`: Shader manager that reads from the config atom
- Integration with WebGL fluid simulation

This demonstrates the full pattern for creating a configurable shader effect with a professional UI.
