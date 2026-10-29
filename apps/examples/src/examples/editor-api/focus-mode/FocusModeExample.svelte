<script lang="ts">
	import { SvelteDraw, type Editor } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'

	function handleMount(editor: Editor) {
		// [1]
		editor.updateInstanceState({ isFocusMode: true })
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw onMount={handleMount} />
</div>

<!--
[1]
Focus mode is a flag on the editor's instance state. `updateInstanceState` sets it; the default UI
reads it and hides everything except a small exit button. When a `persistenceKey` is used, this
flag is preserved as a user preference, so setting it in `onMount` forces it on regardless.
-->
