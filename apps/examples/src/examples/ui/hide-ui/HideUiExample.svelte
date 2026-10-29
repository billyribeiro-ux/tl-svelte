<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
</script>

<div class="svelte-draw__editor">
	<SvelteDraw persistenceKey="hide-ui-example" hideUi />
</div>

<!--
`hideUi` removes all of svelte-draw's default UI but keeps the editor, its tools, and its
keyboard shortcuts. Build your own controls on top with `getEditor()`; see the
custom UI example for a starting point.
-->
