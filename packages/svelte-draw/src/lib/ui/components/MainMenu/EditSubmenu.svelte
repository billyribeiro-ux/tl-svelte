<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	const messages = defineMessages({
		menuEdit: { id: 'menu.edit', defaultMessage: 'Edit' },
	})
</script>

<script lang="ts">
	import ClipboardMenuGroup from '../menu-items/ClipboardMenuGroup.svelte'
	import ConversionsMenuGroup from '../menu-items/ConversionsMenuGroup.svelte'
	import SelectAllMenuItem from '../menu-items/SelectAllMenuItem.svelte'
	import SvelteDrawUiMenuGroup from '../primitives/menus/SvelteDrawUiMenuGroup.svelte'
	import SvelteDrawUiMenuSubmenu from '../primitives/menus/SvelteDrawUiMenuSubmenu.svelte'
	import LockGroup from './LockGroup.svelte'
	import MiscMenuGroup from './MiscMenuGroup.svelte'
	import UndoRedoGroup from './UndoRedoGroup.svelte'

</script>

<SvelteDrawUiMenuSubmenu id="edit" label={messages.menuEdit.id}>
	<UndoRedoGroup />
	<ClipboardMenuGroup />
	<ConversionsMenuGroup />
	<MiscMenuGroup />
	<LockGroup />
	<SvelteDrawUiMenuGroup id="select-all">
		<SelectAllMenuItem />
	</SvelteDrawUiMenuGroup>
</SvelteDrawUiMenuSubmenu>
