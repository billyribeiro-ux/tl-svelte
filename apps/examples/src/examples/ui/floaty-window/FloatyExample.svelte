<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import FloatyWindow from './FloatyWindow.svelte'

	// There's a guide at the bottom of this file!
</script>

<div class="svelte-draw__editor">
	<SvelteDraw persistenceKey="svelteDraw_floaty_example">
		<FloatyWindow />
	</SvelteDraw>
</div>

<!--
Moving the browser window across the screen pans the camera by the same amount, so the
canvas looks like it's pinned to the desktop while the window slides over it. This was
[popular on social media](https://x.com/steveruizok/status/1727436505440981099) for a while.

[1] (FloatyWindow.svelte)
Any component rendered as a child of `<SvelteDraw>` can call `getEditor()`, so this
component runs its effect once the editor exists and renders nothing.

[2]
`window.screenX` / `screenY` are the window's position on the screen. When they change,
the camera is set to the negative of that offset so page space stays fixed relative to
the screen. Camera coordinates are page-space, so this is exact at zoom 1.

[3]
There's no DOM event for the window moving, so we poll on the editor's `tick` event and
unsubscribe in the effect cleanup.
-->
