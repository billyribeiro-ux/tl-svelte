<script lang="ts">
	import type { Snippet } from 'svelte'
	import { EditorPortal } from 'svelte-draw'

	/** The sidebar surface, portaled into the container. It scrolls its own list, so — unlike svelte-draw's
	 *  wheel-transparent panels — a wheel over it doesn't pan the canvas. */
	let { children }: { children: Snippet } = $props()
</script>

<EditorPortal>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="tlui-cmt-canvas-sidebar" oncontextmenu={(e) => e.stopPropagation()}>
		{@render children()}
	</div>
</EditorPortal>
