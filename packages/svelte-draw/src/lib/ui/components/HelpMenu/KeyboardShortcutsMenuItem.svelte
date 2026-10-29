<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	const messages = defineMessages({
		helpMenuKeyboardShortcuts: {
			id: 'help-menu.keyboard-shortcuts',
			defaultMessage: 'Keyboard shortcuts',
		},
	})
</script>

<script lang="ts">
	import { getUiComponents } from '../../context/components'
	import { getDialogs } from '../../context/dialogs'
	import SvelteDrawUiMenuItem from '../primitives/menus/SvelteDrawUiMenuItem.svelte'


	// Read through the object (not destructured) so an override that changes follows.
	const components = getUiComponents()
	const { addDialog } = getDialogs()

	function handleSelect() {
		const KeyboardShortcutsDialog = components.KeyboardShortcutsDialog
		if (KeyboardShortcutsDialog) addDialog({ component: KeyboardShortcutsDialog })
	}
</script>

{#if components.KeyboardShortcutsDialog}
	<SvelteDrawUiMenuItem
		id="keyboard-shortcuts-button"
		label={messages.helpMenuKeyboardShortcuts.id}
		readonlyOk
		onSelect={handleSelect}
	/>
{/if}
