<script lang="ts" module>
	import { DefaultSizeStyle } from 'svelte-draw'

	// Call this at module level, before any editor is created, so every editor
	// (and every new shape) picks up the new default.
	DefaultSizeStyle.setDefaultValue('s')
</script>

<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
</script>

<div class="svelte-draw__editor">
	<SvelteDraw persistenceKey="changing-default-style-example" />
</div>
