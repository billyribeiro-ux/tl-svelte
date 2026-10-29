<script lang="ts">
	import { SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './reactive-inputs.css'
	import ReactiveInputsPanel from './ReactiveInputsPanel.svelte'

	// There's a guide at the bottom of this file!

	const components: TLComponents = {
		TopPanel: ReactiveInputsPanel,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {components} />
</div>

<!--
[1]
`editor.inputs` exposes pointer state through getters (`getCurrentPagePoint()`, `getOriginScreenPoint()`,
and so on) that read reactive atoms. Reading them inside `fromComputed` subscribes the component, so it
updates whenever the pointer moves. Reading them outside a reactive context still works but won't
update the UI.

[2]
Modifier keys are reactive too. `getAccelKey()` is the platform accelerator (Cmd on Mac, Ctrl elsewhere),
which is what you want for cross-platform shortcuts.

[3]
Screen points are relative to the editor's container. Page points are in canvas coordinates, so they
account for the camera's pan and zoom. Origin points are where the last pointer down happened.

[4]
Pointer velocity is updated by the tick manager, in pixels per millisecond. It's useful for detecting
flicks or driving physics-style interactions.
-->
