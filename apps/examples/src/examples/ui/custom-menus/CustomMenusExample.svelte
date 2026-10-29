<script lang="ts" module>
	import { type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import CustomActionsMenu from './CustomActionsMenu.svelte'
	import CustomContextMenu from './CustomContextMenu.svelte'
	import CustomDebugMenu from './CustomDebugMenu.svelte'
	import CustomHelpMenu from './CustomHelpMenu.svelte'
	import CustomKeyboardShortcutsDialog from './CustomKeyboardShortcutsDialog.svelte'
	import CustomMainMenu from './CustomMainMenu.svelte'
	import CustomNavigationPanel from './CustomNavigationPanel.svelte'
	import CustomPageMenu from './CustomPageMenu.svelte'
	import CustomQuickActions from './CustomQuickActions.svelte'
	import CustomStylePanel from './CustomStylePanel.svelte'
	import CustomToolbar from './CustomToolbar.svelte'
	import CustomZoomMenu from './CustomZoomMenu.svelte'

	// There's a guide at the bottom of this file! Each numbered menu lives in its own
	// `Custom<Name>.svelte` file next to this one.

	const components: TLComponents = {
		ActionsMenu: CustomActionsMenu,
		ContextMenu: CustomContextMenu,
		DebugMenu: CustomDebugMenu,
		HelpMenu: CustomHelpMenu,
		KeyboardShortcutsDialog: CustomKeyboardShortcutsDialog,
		MainMenu: CustomMainMenu,
		NavigationPanel: CustomNavigationPanel,
		PageMenu: CustomPageMenu,
		QuickActions: CustomQuickActions,
		StylePanel: CustomStylePanel,
		Toolbar: CustomToolbar,
		ZoomMenu: CustomZoomMenu,
	}
</script>

<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {components} />
</div>

<!--
You can use the `components` prop to override svelte-draw's default menus. You can provide a Svelte
component of your own, import our default component and add to it, or return null to hide it
completely. This example does this with every menu in svelte-draw. The thistle-colored areas mark the
custom additions.

[1]
The actions menu is a dropdown found in the top-left of the svelte-draw component, or just above the
toolbar on smaller screens. It contains actions related to editing shapes such as grouping,
rotating, or changing shape order.

[2]
Create some shapes, select them, and right click the selection to see the custom context menu.

[3]
The debug menu contains helpful menu items for debugging the svelte-draw component. To show it, turn
on debug mode in the preferences.

[4]
The help menu contains menu items to change the language of the application and to open the
keyboard shortcuts dialog.

[5]
The keyboard shortcuts dialog is a modal that lists all the keyboard shortcuts available in
svelte-draw. You can open it via the help menu.

[6]
The main menu contains the Edit, Shape, and Preferences submenus, among others. To open it, click
the hamburger icon in the top left corner of the svelte-draw component.

[7]
The navigation panel is in the bottom left of the svelte-draw component at larger breakpoints. It
normally contains the zoom menu and a minimap. Replacing it drops the zoom menu too, so this one
renders `ZoomMenu` from `getUiComponents` to keep [12] reachable. The zoom menu's trigger is a
toolbar button, so it has to sit inside a `SvelteDrawUiToolbar`.

[8]
The page menu contains options for creating and editing pages. To open it, click the page name in
the top left of the svelte-draw component.

[9]
The quick actions menu appears next to the main menu, or above the toolbar on smaller screens.

[10]
The style panel appears on the right side of the svelte-draw component. It contains options to change
the style of shapes, such as color, stroke width, and opacity.

[11]
The toolbar contains the tools used to create and select shapes. Here we add the left-leaning
rhombus geo shape at the front and a "delete all" button at the end. There is no `tool.rhombus-2`
translation key, so the item reuses the style panel's `geo-style.rhombus-2` label.

[12]
The zoom menu is in the bottom left of the svelte-draw component. The button that opens it is labeled
with a percentage indicating the editor's current zoom level.
-->
