<script lang="ts">
	import { SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import InfoPanel from './InfoPanel.svelte'

	// There's a guide at the bottom of this file!

	const components: TLComponents = {
		SharePanel: InfoPanel,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {components} />
</div>

<!--
svelte-draw's editor state is built on signals. Any `editor.get...()` call reads a signal, and
Svelte does not track those reads on its own. There are two bridges, both in `InfoPanel.svelte`
(placed in the `SharePanel` slot, above the style panel).

[1]
`fromComputed(name, fn)` wraps a function that reads signals and returns an object whose
`.current` re-runs the reading template or `$derived` only when the function's *return value*
changes. This is the replacement for React's `useValue` and `track`. For a one-off signal use
`fromSignal(signal)`.

[2]
`quickReactor` runs a side effect synchronously whenever the signals it reads change (the
replacement for `useQuickReactor`). Call it from `$effect` and return its result so it is
stopped on teardown. Here it keeps the document title in sync with the shape count.
-->
