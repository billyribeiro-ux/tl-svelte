<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		persistenceKey="readonly-example"
		onMount={(editor) => {
			editor.updateInstanceState({ isReadonly: true })
		}}
	/>
</div>
