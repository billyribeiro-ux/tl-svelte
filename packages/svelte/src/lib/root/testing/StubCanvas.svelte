<script lang="ts">
	import type { TLCanvasComponentProps } from "../../context/components"

	let { class: className }: TLCanvasComponentProps = $props()
</script>

<!-- TEST STUB: a minimal stand-in for the canvas layer's DefaultCanvas, so root tests do not depend on it. -->
<div class={["tl-canvas", className]} data-testid="stub-canvas"></div>
