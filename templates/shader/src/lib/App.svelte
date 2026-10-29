<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import { EXAMPLES } from './examples'
	import { selectedExample } from './selectedExample.svelte'
	import ShaderStylePanel from './ShaderStylePanel.svelte'

	const example = $derived(EXAMPLES.find((e) => e.value === selectedExample.current))
	const components = $derived({ Background: example?.Renderer, StylePanel: ShaderStylePanel })
</script>

<div class="shader-app">
	<SvelteDraw persistenceKey="shader" {components} />
</div>
