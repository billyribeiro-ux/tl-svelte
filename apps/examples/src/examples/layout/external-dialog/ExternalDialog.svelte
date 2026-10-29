<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	// [1]
	import './external-dialog.css'
</script>

<div style="margin: 32px; width: 600px; height: 400px;">
	<SvelteDraw />
</div>

<!--
[1]
By default the dialog overlay and positioner are `position: absolute` and fill the
`SvelteDraw` container. Switching them to `position: fixed` makes them fill the browser
window instead, so a dialog can be centered over the whole page even when the editor
is a small inset. See external-dialog.css.
-->
