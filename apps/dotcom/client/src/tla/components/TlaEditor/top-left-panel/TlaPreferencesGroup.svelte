<script lang="ts">
	import {
		AccessibilityMenu,
		ColorSchemeMenu,
		InputModeMenu,
		KeyboardShortcutsMenuItem,
		LanguageMenu,
		SvelteDrawUiMenuGroup,
		SvelteDrawUiMenuSubmenu,
		ToggleDebugModeItem,
		ToggleDynamicSizeModeItem,
		ToggleEdgeScrollingItem,
		ToggleFocusModeItem,
		ToggleGridItem,
		TogglePasteAtCursorItem,
		ToggleSnapModeItem,
		ToggleToolLockItem,
		ToggleWrapModeItem,
	} from 'svelte-draw'
	import UIThemeSubmenu from '../../menu-items/UIThemeSubmenu.svelte'
</script>

<SvelteDrawUiMenuGroup id="preferences">
	<SvelteDrawUiMenuSubmenu id="preferences" label="menu.preferences">
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
			<ColorSchemeMenu />
			<UIThemeSubmenu />
			<AccessibilityMenu />
			<InputModeMenu />
		</SvelteDrawUiMenuGroup>
	</SvelteDrawUiMenuSubmenu>
	<LanguageMenu />
	<KeyboardShortcutsMenuItem />
</SvelteDrawUiMenuGroup>
