<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
</script>

<div
	style="width: 150vw; height: 150vh; display: flex; justify-content: center; align-items: center; background-color: #fff;"
>
	<div style="width: 60vw; height: 80vh;">
		<SvelteDraw persistenceKey="scroll-example" autoFocus={true} />
	</div>
</div>

<!--
While the editor is focused it consumes wheel events to pan and zoom, so the page won't
scroll when the pointer is over the canvas. Try turning off `autoFocus` to see the
difference.
-->
