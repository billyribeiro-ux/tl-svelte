<script lang="ts" module>
	import { type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import CustomSharePanel from './CustomSharePanel.svelte'
	import StackedDialogLauncher from './StackedDialogLauncher.svelte'

	// There's a guide at the bottom of this file

	const components: TLComponents = {
		SharePanel: CustomSharePanel,
		InFrontOfTheCanvas: StackedDialogLauncher,
	}
</script>

<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {components} persistenceKey="toasts-and-dialogs-example" />
</div>

<!--
The `getToasts` and `getDialogs` functions return objects with functions to add, remove, and
clear toasts and dialogs from anywhere inside `<SvelteDraw />`. Call them during component
initialisation.

[1] See `MyDialog.svelte`
A dialog built from svelte-draw's dialog primitives (`SvelteDrawUiDialogHeader`,
`SvelteDrawUiDialogBody`, `SvelteDrawUiDialogFooter`, and so on), so it matches the rest
of the UI. `onClose` is passed to your component by the dialog system; call it
from your own buttons to close the dialog. The `onClose` you pass to `addDialog`
is separate: it runs after the dialog closes, however it was dismissed (here we
show a toast from it).

[2] See `MySimpleDialog.svelte`
...or render anything you like. The dialog system only supplies the modal
wrapper and the `onClose` callback.

[3] See `MyDialogWithSelect.svelte`
Dialogs can contain their own popups, like this bits-ui select. Because svelte-draw's
dialog is a dismissable layer, clicking outside an open select closes just
the select and leaves the dialog open; a second outside click closes the dialog.
Portal the select into `getContainer()` so it inherits svelte-draw's CSS variables.

[4] See `MyNestedDialog.svelte`
Dialogs stack. A dialog can call `addDialog` to open another on top of itself,
and each one, including the topmost, keeps its own controls interactive.

[5] See `CustomSharePanel.svelte`
The launcher buttons live in the `SharePanel` slot, top right of the UI.

[6] See `StackedDialogLauncher.svelte`
The stacked-dialog launcher is rendered in `InFrontOfTheCanvas` instead, because
the share panel overflows off-screen on narrow mobile layouts and the e2e test
for stacked dialogs needs to reach it with a tap.
-->
