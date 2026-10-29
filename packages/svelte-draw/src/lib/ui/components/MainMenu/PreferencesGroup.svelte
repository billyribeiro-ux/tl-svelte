<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	const messages = defineMessages({
		menuPreferences: { id: 'menu.preferences', defaultMessage: 'Preferences' },
	})
</script>

<script lang="ts">
	import AccessibilityMenu from '../AccessibilityMenu.svelte'
	import ColorSchemeMenu from '../ColorSchemeMenu.svelte'
	import KeyboardShortcutsMenuItem from '../HelpMenu/KeyboardShortcutsMenuItem.svelte'
	import InputModeMenu from '../InputModeMenu.svelte'
	import LanguageMenu from '../LanguageMenu.svelte'
	import ToggleDebugModeItem from '../menu-items/ToggleDebugModeItem.svelte'
	import ToggleDynamicSizeModeItem from '../menu-items/ToggleDynamicSizeModeItem.svelte'
	import ToggleEdgeScrollingItem from '../menu-items/ToggleEdgeScrollingItem.svelte'
	import ToggleFocusModeItem from '../menu-items/ToggleFocusModeItem.svelte'
	import ToggleGridItem from '../menu-items/ToggleGridItem.svelte'
	import TogglePasteAtCursorItem from '../menu-items/TogglePasteAtCursorItem.svelte'
	import ToggleSnapModeItem from '../menu-items/ToggleSnapModeItem.svelte'
	import ToggleToolLockItem from '../menu-items/ToggleToolLockItem.svelte'
	import ToggleWrapModeItem from '../menu-items/ToggleWrapModeItem.svelte'
	import SvelteDrawUiMenuGroup from '../primitives/menus/SvelteDrawUiMenuGroup.svelte'
	import SvelteDrawUiMenuSubmenu from '../primitives/menus/SvelteDrawUiMenuSubmenu.svelte'

</script>

<SvelteDrawUiMenuGroup id="preferences">
	<SvelteDrawUiMenuSubmenu id="preferences" label={messages.menuPreferences.id}>
		<SvelteDrawUiMenuGroup id="preferences-actions">
			<ToggleSnapModeItem />
			<ToggleToolLockItem />
			<ToggleGridItem />
			<ToggleWrapModeItem />
			<ToggleFocusModeItem />
			<ToggleEdgeScrollingItem />
			<ToggleDynamicSizeModeItem />
			<TogglePasteAtCursorItem />
			<ToggleDebugModeItem />
		</SvelteDrawUiMenuGroup>
		<SvelteDrawUiMenuGroup id="user-interface-submenus">
			<AccessibilityMenu />
			<InputModeMenu />
			<ColorSchemeMenu />
		</SvelteDrawUiMenuGroup>
	</SvelteDrawUiMenuSubmenu>
	<LanguageMenu />
	<KeyboardShortcutsMenuItem />
</SvelteDrawUiMenuGroup>
