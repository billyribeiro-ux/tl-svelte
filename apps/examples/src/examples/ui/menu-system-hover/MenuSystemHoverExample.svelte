<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import HoverControlledMenu from './HoverControlledMenu.svelte'
	import './menu-system-hover.css'

	// There's a guide at the bottom of this file!
</script>

<div class="svelte-draw__editor">
	<SvelteDraw>
		<HoverControlledMenu />
	</SvelteDraw>
</div>

<!--
svelte-draw tracks which menus are open in `editor.menus`, keyed by menu id. The dropdown
primitives read and write that state, so anything else that writes it can open or close
a menu too. Here two hover zones do exactly that.

[1] (HoverControlledMenu.svelte)
`createMenuIsOpen(id)` returns `{ isOpen, onOpenChange }` for a menu id and updates when the
state changes.

[2]
`editor.menus.addOpenMenu('hover-menu')` marks the menu as open. The dropdown with the
matching `id` responds by opening.

[3]
`editor.menus.deleteOpenMenu('hover-menu')` marks it closed again.

[4]
`SvelteDrawUiDropdownMenuRoot` takes the same `id`, which is what links it to [2] and [3].
Clicking the trigger still toggles the menu the normal way.
-->
