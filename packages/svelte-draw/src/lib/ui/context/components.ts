import type { Component, Snippet } from 'svelte'
import { getShowCollaborationUi } from '../hooks/useCollaborationStatus'
import { getDefaultUiComponents } from '../uiWiring'
import { defineUiContext } from './uiContext'

// The Radix/React `ComponentType<Props>` entries become Svelte `Component<Props>`. The prop
// interfaces of the Default* components (TLUiContextMenuProps, TLUiStylePanelProps, ...) live in
// components that are ported separately; until they are, those entries are typed `Component<any>`.
// The doc comments say which props each override receives.
type UiComponent = Component<any>

/** @public */
export interface TLUiComponents {
	/** Receives `TLUiContextMenuProps`. */
	ContextMenu?: UiComponent | null
	/** Receives `TLUiActionsMenuProps`. */
	ActionsMenu?: UiComponent | null
	/** Receives `TLUiHelpMenuProps`. */
	HelpMenu?: UiComponent | null
	/** Receives `TLUiZoomMenuProps`. */
	ZoomMenu?: UiComponent | null
	/** Receives `TLUiMainMenuProps`. */
	MainMenu?: UiComponent | null
	Minimap?: UiComponent | null
	/** Receives `TLUiStylePanelProps`. */
	StylePanel?: UiComponent | null
	PageMenu?: UiComponent | null
	NavigationPanel?: UiComponent | null
	Toolbar?: UiComponent | null
	/** Receives `TLUiRichTextToolbarProps`. */
	RichTextToolbar?: UiComponent | null
	ImageToolbar?: UiComponent | null
	VideoToolbar?: UiComponent | null
	/** Receives `TLUiKeyboardShortcutsDialogProps`. */
	KeyboardShortcutsDialog?: UiComponent | null
	/** Receives `TLUiQuickActionsProps`. */
	QuickActions?: UiComponent | null
	/** Receives `TLUiHelperButtonsProps`. */
	HelperButtons?: UiComponent | null
	DebugPanel?: UiComponent | null
	DebugMenu?: UiComponent | null
	MenuPanel?: UiComponent | null
	TopPanel?: UiComponent | null
	SharePanel?: UiComponent | null
	CursorChatBubble?: UiComponent | null
	Dialogs?: UiComponent | null
	Toasts?: UiComponent | null
	A11y?: UiComponent | null
	FollowingIndicator?: UiComponent | null
	PeopleMenu?: UiComponent | null
	/** Receives `TLUiPeopleMenuAvatarProps`. */
	PeopleMenuAvatar?: UiComponent | null
	/** Receives `TLUiPeopleMenuItemProps`. */
	PeopleMenuItem?: UiComponent | null
	/** Receives `TLUiPeopleMenuFacePileProps`. */
	PeopleMenuFacePile?: UiComponent | null
	UserPresenceEditor?: UiComponent | null
}

/** @public */
export interface TLUiComponentsProviderProps {
	overrides?: TLUiComponents
	children: Snippet
}

/** The components that only exist when the editor has a collaboration config. */
const COLLABORATION_ONLY: readonly (keyof TLUiComponents)[] = ['SharePanel', 'CursorChatBubble']

/** Entries that default to `null` (rendered by nothing) rather than to a `Default*` component. */
const NULL_BY_DEFAULT: readonly (keyof TLUiComponents)[] = ['HelpMenu', 'TopPanel']

const componentsContext = defineUiContext<TLUiComponents>('svelte-draw.ui.components')

/**
 * Builds the resolved component map: the registered defaults, with `HelpMenu`/`TopPanel` off,
 * the collaboration-only components off when `showCollaborationUi` is false, and `overrides` on
 * top. The returned object reads `getOverrides()` lazily on every property access, so it follows a
 * changing `overrides` prop inside `$derived`/templates (destructuring takes a snapshot).
 *
 * Must be called during component initialisation.
 */
export function createUiComponents(getOverrides: () => TLUiComponents | undefined): TLUiComponents {
	const showCollaborationUi = getShowCollaborationUi()
	const defaults = getDefaultUiComponents()
	const resolved: TLUiComponents = {}
	const keys = new Set<keyof TLUiComponents>([
		...(Object.keys(defaults) as (keyof TLUiComponents)[]),
		...COLLABORATION_ONLY,
		...NULL_BY_DEFAULT,
	])
	for (const key of keys) {
		Object.defineProperty(resolved, key, {
			enumerable: true,
			get() {
				const overrides = getOverrides()
				if (overrides && key in overrides) return overrides[key]
				if (NULL_BY_DEFAULT.includes(key)) return null
				if (COLLABORATION_ONLY.includes(key) && !showCollaborationUi) return null
				return defaults[key]
			},
		})
	}
	// Overrides for keys that have no default (a custom or not-yet-registered entry).
	for (const key of Object.keys(getOverrides() ?? {}) as (keyof TLUiComponents)[]) {
		if (keys.has(key)) continue
		Object.defineProperty(resolved, key, {
			enumerable: true,
			get: () => getOverrides()?.[key],
		})
	}
	return resolved
}

/** @internal */
export function setUiComponents(value: TLUiComponents): void {
	componentsContext.set(value)
}

/** Replaces `useSvelteDrawUiComponents`. Throws outside a provider. @public */
export function getUiComponents(): TLUiComponents {
	return componentsContext.get(
		'getUiComponents must be used within a SvelteDrawUiComponentsProvider'
	)
}
