<script lang="ts">
	import { SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './event-blocker.css'
	import WelcomeScreen from './WelcomeScreen.svelte'

	// There's a guide at the bottom of this file!

	const components: TLComponents = {
		InFrontOfTheCanvas: WelcomeScreen,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw persistenceKey="event-blocker-example" {components} />
</div>

<!--
[1]
The `InFrontOfTheCanvas` slot is a full-size layer over the canvas that starts with
`pointer-events: none`, so anything rendered here is click-through by default. This
backdrop just centers the panel; pointer events pass straight through it to the canvas.
See WelcomeScreen.svelte.

[2]
Setting `pointer-events: all` on the panel opts it back in. The slot sits above the canvas
and marks pointer events that start inside it as handled (see `editor.markEventAsHandled`),
so svelte-draw ignores them: clicking or dragging here won't select, draw, or pan. You don't need
to call `stopPropagation` yourself.

[3]
svelte-draw disables text selection everywhere inside its container so that dragging on the
canvas doesn't highlight text. If you want the user to be able to select text in your
overlay, set `user-select: text` on it.
-->
