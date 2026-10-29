<script lang="ts" module>
	import { type TLEditorComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './drag-and-drop-tray.css'
	import DragAndDropTray from './DragAndDropTray.svelte'

	// There's a guide at the bottom of this file! The tray itself is in `DragAndDropTray.svelte`.

	// [8]
	const components: TLEditorComponents = {
		InFrontOfTheCanvas: DragAndDropTray,
	}
</script>

<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
</script>

<div class="svelte-draw__editor">
	<SvelteDraw persistenceKey="drag-and-drop-tray-example" {components} />
</div>

<!--
This example builds a tray of items that can be dragged onto the canvas to create shapes.
The tray is a custom `InFrontOfTheCanvas` component, so it renders over the canvas but
inside svelte-draw's UI layer, and it drives the interaction with its own small state machine.

[1]
`DragState` is a discriminated union: `idle`, `pointing_item` (pointer is down but hasn't
moved far enough to count as a drag), and `dragging`. Modelling it this way means each
handler only has to deal with the transitions that are valid from its current state.

[2]
`rTrayContainer` is used for bounds checking (we hide the preview while the pointer is
still over the tray) and `rDraggingImage` is the preview element that follows the cursor.

[3]
`atom` gives us a reactive signal that both the event handlers and the `quickReactor` below
can read; `fromSignal` bridges it into the template.

[4]
The handlers are plain functions that read the atom directly, so they don't go stale.
	[a] We only enter `dragging` after the pointer moves more than 10px, so a plain click
	on a tray item doesn't accidentally create a shape.
	[b] While dragging we just track the pointer position; the preview is positioned in [5].
	[c] On pointer up while dragging, convert the screen point to page space with
	`editor.screenToPage()` and create the shape there. `markHistoryStoppingPoint` makes
	each drop its own undo step.
	[d] On pointer down we capture the pointer on the item element, so we keep receiving
	move/up events even when the pointer leaves it. The item index comes from a `data-`
	attribute so one handler serves every item.

[5]
`quickReactor` (inside `$effect`) runs synchronously whenever `dragState` changes and writes styles to the
preview element directly. Positioning via the DOM rather than Svelte state avoids a
render on every pointer move. The offset by `getViewportScreenBounds()` converts the
client coordinates to coordinates relative to the editor container, which is what an
`InFrontOfTheCanvas` component is positioned against.

[6]
Each tray item gets the shared pointer handlers and a `data-drag_item_index` attribute
that [4d] reads back.

[7]
The preview element only has content while dragging; [5] handles showing and hiding it.

[8]
`components` is defined at module level so `<SvelteDraw>` doesn't see a new object on every
update, which would remount the UI.
-->
