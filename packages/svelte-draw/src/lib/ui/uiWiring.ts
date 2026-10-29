import type { Editor } from '@svelte-draw/editor'
import type { Component } from 'svelte'
import type { TLUiComponents } from './context/components'
import type { TLUiDialogProps } from './context/dialogs'

/**
 * The seam between the UI foundation (context, hooks, primitives) and the UI components that sit
 * on top of it (Toolbar, StylePanel, menus, dialogs, ...).
 *
 * In React, `context/components.tsx` and `context/actions.tsx` imported those components
 * directly, which would make the foundation depend on everything built over it. The components are
 * therefore registered here, once, by the module that ports them (call {@link registerUiWiring}
 * from `ui/components/index.ts` or equivalent), and read lazily when a provider is created.
 *
 * Until a component is registered, the entry stays unset: `defaultComponents` simply lacks it, and
 * the dialogs/announcement helpers throw when used, instead of silently doing nothing.
 *
 * @internal
 */
export interface TLUiWiring {
	/** The `Default*` components, keyed like {@link TLUiComponents}. */
	defaultComponents: TLUiComponents
	/** `SkipToMainContent` from `../components/A11y` */
	SkipToMainContent: Component
	/** `../components/EditLinkDialog` */
	EditLinkDialog: Component<TLUiDialogProps>
	/** `../components/EmbedDialog` */
	EmbedDialog: Component<TLUiDialogProps>
	/** `generateShapeAnnouncementMessage` from `../components/A11y` */
	generateShapeAnnouncementMessage(opts: {
		editor: Editor
		selectedShapeIds: ReturnType<Editor['getSelectedShapeIds']>
		msg(key: string, values?: Record<string, string | number>): string
	}): string | undefined
}

const wiring: Partial<TLUiWiring> = {}

/** @internal */
export function registerUiWiring(partial: Partial<TLUiWiring>): void {
	Object.assign(wiring, partial)
}

/** @internal */
export function getUiWiring<K extends keyof TLUiWiring>(key: K): TLUiWiring[K] {
	const value = wiring[key]
	if (value === undefined) {
		throw new Error(
			`ui wiring "${key}" was used before it was registered. Import the UI components module (which calls registerUiWiring) first.`
		)
	}
	return value
}

/** @internal */
export function getDefaultUiComponents(): TLUiComponents {
	return wiring.defaultComponents ?? {}
}
