<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		onMount={(editor) => {
			editor.updateInstanceState({ isGridMode: true })

			// Returning `prev` rejects the change no matter where it came from: menu, shortcut, or code.
			editor.sideEffects.registerBeforeChangeHandler('instance', (prev, next) => {
				if (!next.isGridMode) {
					return prev
				}
				return next
			})
		}}
	/>
</div>
