<script lang="ts">
	import { SvelteDraw, type TLUiEventHandler } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { getCodeSnippet } from './codeSnippets'
	import './ui-events.css'

	// There's a guide at the bottom of this file!

	let uiEvents = $state.raw<string[]>([])

	// [1]
	const handleUiEvent: TLUiEventHandler = (name, data) => {
		const codeSnippet = getCodeSnippet(name, data)
		uiEvents = [
			...uiEvents,
			`event: ${name} ${JSON.stringify(data)}${codeSnippet ? `\ncode:  ${codeSnippet}` : ''}`,
		]
	}
</script>

<div class="ui-events">
	<div class="ui-events__editor">
		<!-- [2] -->
		<SvelteDraw onUiEvent={handleUiEvent} />
	</div>
	<div class="ui-events__log" oncopy={(event) => event.stopPropagation()}>
		{#each uiEvents as t, i (i)}
			<pre>{t}</pre>
		{/each}
	</div>
</div>

<!--
UI events are the high-level actions the default UI performs: selecting a tool, grouping
shapes, zooming, toggling grid mode, and so on. They fire whichever way the action was
triggered (menu, toolbar, or keyboard shortcut) and each comes with a `source` telling you
which. They don't fire when you call the same editor methods yourself. For the full list, see
the `TLUiEventMap` type; for `source` values, see `TLUiEventSource`.

[1]
The handler receives the event name and its data. This example also shows the editor API call
that the default UI made for the event (see `codeSnippets.ts`), which is a handy way to learn
which method does what.

[2]
Pass the handler to the `onUiEvent` prop of `<SvelteDraw>`. Since it's called for every UI action,
this is a good hook for analytics.

To listen to input events or document changes instead, see the canvas events and store events
examples.
-->
