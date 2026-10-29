/**
 * The UI entry point. Importing this module registers the default UI components with the
 * `uiWiring` seam (see `./uiWiring.ts`), which is how `createUiComponents` and the actions context
 * find `DefaultToolbar`, `EditLinkDialog` and the rest without the UI foundation importing them.
 * `SvelteDraw.svelte` imports it, so any consumer of the SDK gets the registration.
 *
 * The React version imported these components straight into `context/components.tsx`; the
 * registration lives here instead so the foundation (context, hooks, primitives) stays free of the
 * components built on top of it.
 */

import DefaultA11yAnnouncer from './components/A11y.svelte'
import { generateShapeAnnouncementMessage } from './components/a11yAnnouncements.svelte'
import DefaultActionsMenu from './components/ActionsMenu/DefaultActionsMenu.svelte'
import DefaultContextMenu from './components/ContextMenu/DefaultContextMenu.svelte'
import CursorChatBubble from './components/CursorChatBubble.svelte'
import DefaultDebugMenu from './components/DebugMenu/DefaultDebugMenu.svelte'
import DefaultDebugPanel from './components/DefaultDebugPanel.svelte'
import DefaultFollowingIndicator from './components/DefaultFollowingIndicator.svelte'
import DefaultMenuPanel from './components/DefaultMenuPanel.svelte'
import DefaultDialogs from './components/Dialogs.svelte'
import EditLinkDialog from './components/EditLinkDialog.svelte'
import EmbedDialog from './components/EmbedDialog.svelte'
import DefaultHelperButtons from './components/HelperButtons/DefaultHelperButtons.svelte'
import DefaultKeyboardShortcutsDialog from './components/KeyboardShortcutsDialog/DefaultKeyboardShortcutsDialog.svelte'
import DefaultMainMenu from './components/MainMenu/DefaultMainMenu.svelte'
import DefaultMinimap from './components/Minimap/DefaultMinimap.svelte'
import DefaultNavigationPanel from './components/NavigationPanel/DefaultNavigationPanel.svelte'
import DefaultPageMenu from './components/PageMenu/DefaultPageMenu.svelte'
import DefaultQuickActions from './components/QuickActions/DefaultQuickActions.svelte'
import DefaultPeopleMenu from './components/SharePanel/DefaultPeopleMenu.svelte'
import DefaultPeopleMenuAvatar from './components/SharePanel/DefaultPeopleMenuAvatar.svelte'
import DefaultPeopleMenuFacePile from './components/SharePanel/DefaultPeopleMenuFacePile.svelte'
import DefaultPeopleMenuItem from './components/SharePanel/DefaultPeopleMenuItem.svelte'
import DefaultSharePanel from './components/SharePanel/DefaultSharePanel.svelte'
import DefaultUserPresenceEditor from './components/SharePanel/DefaultUserPresenceEditor.svelte'
import SkipToMainContent from './components/SkipToMainContent.svelte'
import DefaultStylePanel from './components/StylePanel/DefaultStylePanel.svelte'
import DefaultToasts from './components/Toasts.svelte'
import DefaultImageToolbar from './components/Toolbar/DefaultImageToolbar.svelte'
import DefaultRichTextToolbar from './components/Toolbar/DefaultRichTextToolbar.svelte'
import DefaultToolbar from './components/Toolbar/DefaultToolbar.svelte'
import DefaultVideoToolbar from './components/Toolbar/DefaultVideoToolbar.svelte'
import DefaultZoomMenu from './components/ZoomMenu/DefaultZoomMenu.svelte'
import { registerUiWiring } from './uiWiring'

// `HelpMenu` and `TopPanel` default to `null`, and `SharePanel` / `CursorChatBubble` are switched
// off without a collaboration config, all by `createUiComponents`; they are listed here only as the
// components used when an app turns them on.
registerUiWiring({
	defaultComponents: {
		ContextMenu: DefaultContextMenu,
		ActionsMenu: DefaultActionsMenu,
		ZoomMenu: DefaultZoomMenu,
		MainMenu: DefaultMainMenu,
		Minimap: DefaultMinimap,
		StylePanel: DefaultStylePanel,
		PageMenu: DefaultPageMenu,
		NavigationPanel: DefaultNavigationPanel,
		Toolbar: DefaultToolbar,
		RichTextToolbar: DefaultRichTextToolbar,
		ImageToolbar: DefaultImageToolbar,
		VideoToolbar: DefaultVideoToolbar,
		KeyboardShortcutsDialog: DefaultKeyboardShortcutsDialog,
		QuickActions: DefaultQuickActions,
		HelperButtons: DefaultHelperButtons,
		DebugPanel: DefaultDebugPanel,
		DebugMenu: DefaultDebugMenu,
		MenuPanel: DefaultMenuPanel,
		SharePanel: DefaultSharePanel,
		CursorChatBubble,
		Dialogs: DefaultDialogs,
		Toasts: DefaultToasts,
		A11y: DefaultA11yAnnouncer,
		FollowingIndicator: DefaultFollowingIndicator,
		PeopleMenu: DefaultPeopleMenu,
		PeopleMenuAvatar: DefaultPeopleMenuAvatar,
		PeopleMenuItem: DefaultPeopleMenuItem,
		PeopleMenuFacePile: DefaultPeopleMenuFacePile,
		UserPresenceEditor: DefaultUserPresenceEditor,
	},
	SkipToMainContent,
	EditLinkDialog,
	EmbedDialog,
	generateShapeAnnouncementMessage,
})

export { default as SvelteDrawUi, type SvelteDrawUiProps } from './SvelteDrawUi.svelte'
export { default as SvelteDrawUiInFrontOfTheCanvas } from './SvelteDrawUiInFrontOfTheCanvas.svelte'
export { default as DefaultA11yAnnouncer } from './components/A11y.svelte'
export {
	generateShapeAnnouncementMessage,
	setupA11yDebug,
	setupSelectedShapesAnnouncer,
} from './components/a11yAnnouncements.svelte'
export { default as CursorChatBubble } from './components/CursorChatBubble.svelte'
export { default as DefaultFollowingIndicator } from './components/DefaultFollowingIndicator.svelte'
export { default as DefaultDialogs } from './components/Dialogs.svelte'
export { default as EditLinkDialog } from './components/EditLinkDialog.svelte'
export { default as EmbedDialog } from './components/EmbedDialog.svelte'
export { default as LoadingScreen } from './components/LoadingScreen.svelte'
export { default as Spinner } from './components/Spinner.svelte'
export { default as DefaultToasts } from './components/Toasts.svelte'
