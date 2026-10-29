<script lang="ts">
	import { createColorMode, getEditor } from 'svelte-draw'
	import InspectorPanel from './InspectorPanel.svelte'

	// [4]
	const colorMode = createColorMode(getEditor())
</script>

<div class={colorMode.current === 'dark' ? 'tl-theme__dark' : 'tl-theme__light'}>
	<InspectorPanel />
</div>
