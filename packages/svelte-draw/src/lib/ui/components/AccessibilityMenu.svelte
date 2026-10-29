<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	const messages = defineMessages({
		menuAccessibility: { id: 'menu.accessibility', defaultMessage: 'Accessibility' },
	})
</script>

<script lang="ts">
	import ToggleEnhancedA11yModeItem from './menu-items/ToggleEnhancedA11yModeItem.svelte'
	import ToggleKeyboardShortcutsItem from './menu-items/ToggleKeyboardShortcutsItem.svelte'
	import ToggleReduceMotionItem from './menu-items/ToggleReduceMotionItem.svelte'
	import SvelteDrawUiMenuGroup from './primitives/menus/SvelteDrawUiMenuGroup.svelte'
	import SvelteDrawUiMenuSubmenu from './primitives/menus/SvelteDrawUiMenuSubmenu.svelte'

</script>

<SvelteDrawUiMenuSubmenu id="help menu accessibility" label={messages.menuAccessibility.id}>
	<SvelteDrawUiMenuGroup id="accessibility">
		<ToggleReduceMotionItem />
		<ToggleKeyboardShortcutsItem />
		<ToggleEnhancedA11yModeItem />
	</SvelteDrawUiMenuGroup>
</SvelteDrawUiMenuSubmenu>
