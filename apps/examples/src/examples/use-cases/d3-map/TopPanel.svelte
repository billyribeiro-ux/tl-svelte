<script lang="ts">
	import { SvelteDrawUiButton, getEditor } from 'svelte-draw'
	import { resetMap } from './map'

	const editor = getEditor()
</script>

<div class="d3-map-top-panel tlui-menu">
	<SvelteDrawUiButton type="normal" onclick={() => resetMap(editor)}>Reset map</SvelteDrawUiButton>
</div>
