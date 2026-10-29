import type {
	Editor,
	MigrationSequence,
	SvelteDrawOptions,
	TLAnyAssetUtilConstructor,
	TLAnyBindingUtilConstructor,
	TLAnyOverlayUtilConstructor,
	TLAnyShapeUtilConstructor,
	TLCameraOptions,
	TLCurrentUser,
	TLDeepLinkOptions,
	TLEditorSnapshot,
	TLI18nAdapter,
	TLStateNodeConstructor,
	TLStoreBaseOptions,
	TLStoreWithStatus,
	TLTextOptions,
} from '@svelte-draw/editor'
import type { TLShape, TLStore, TLStoreSnapshot, TLThemeId, TLThemes } from '@svelte-draw/tlschema'
import type { Snippet } from 'svelte'
import type { TLEditorComponents } from '../context/components'

/**
 * Props for the {@link SvelteDrawEditor} component, when passing in a `TLStore` directly. If you
 * would like svelte-draw to create a store for you, use {@link SvelteDrawEditorWithoutStoreProps}.
 *
 * @public
 */
export interface SvelteDrawEditorWithStoreProps {
	/**
	 * The store to use in the editor.
	 */
	store: TLStore | TLStoreWithStatus
}

/**
 * Props for the {@link SvelteDrawEditor} component, when not passing in a `TLStore` directly. If
 * you would like to pass in a store directly, use {@link SvelteDrawEditorWithStoreProps}.
 *
 * @public
 */
export interface SvelteDrawEditorWithoutStoreProps extends TLStoreBaseOptions {
	store?: undefined

	/**
	 * Additional migrations to use in the store
	 */
	migrations?: readonly MigrationSequence[]

	/**
	 * A starting snapshot of data to pre-populate the store. Do not supply both this and
	 * `initialData`.
	 */
	snapshot?: TLEditorSnapshot | TLStoreSnapshot

	/**
	 * If you would like to persist the store to the browser's local IndexedDB storage and sync it
	 * across tabs, provide a key here. Each key represents a single svelte-draw document.
	 */
	persistenceKey?: string

	sessionId?: string
}

/** @public */
export type SvelteDrawEditorStoreProps =
	| SvelteDrawEditorWithStoreProps
	| SvelteDrawEditorWithoutStoreProps

/** @public */
export type SvelteDrawEditorProps = SvelteDrawEditorBaseProps & SvelteDrawEditorStoreProps

/**
 * Called when the editor has mounted.
 * @example
 * ```svelte
 * <SvelteDraw onMount={(editor) => editor.selectAll()} />
 * ```
 * @param editor - The editor instance.
 *
 * @public
 */
export type TLOnMountHandler = (editor: Editor) => (() => void | undefined) | undefined | void

/**
 * Base props for the {@link SvelteDrawEditor} component.
 *
 * @public
 */
export interface SvelteDrawEditorBaseProps {
	/**
	 * The component's children. When omitted, the editor renders its `Canvas` component.
	 */
	children?: Snippet

	/**
	 * An array of shape utils to use in the editor.
	 */
	shapeUtils?: readonly TLAnyShapeUtilConstructor[]

	/**
	 * An array of binding utils to use in the editor.
	 */
	bindingUtils?: readonly TLAnyBindingUtilConstructor[]

	/**
	 * An array of asset utils to use in the editor.
	 */
	assetUtils?: readonly TLAnyAssetUtilConstructor[]

	/**
	 * An array of overlay utils to use in the editor for canvas overlay UI elements.
	 */
	overlayUtils?: readonly TLAnyOverlayUtilConstructor[]

	/**
	 * An array of tools to add to the editor's state chart.
	 */
	tools?: readonly TLStateNodeConstructor[]

	/**
	 * Whether to automatically focus the editor when it mounts.
	 */
	autoFocus?: boolean

	/**
	 * Overrides for the editor's components, such as handles, collaborator cursors, etc.
	 */
	components?: TLEditorComponents

	/**
	 * Called when the editor has mounted.
	 */
	onMount?: TLOnMountHandler

	/**
	 * The editor's initial state (usually the id of the first active tool).
	 */
	initialState?: string

	/**
	 * A classname to pass to the editor's container.
	 */
	className?: string

	/**
	 * The user interacting with the editor.
	 */
	user?: TLCurrentUser

	/**
	 * The editor's color scheme. Defaults to `'light'`.
	 *
	 * - `'light'` - Always use light mode.
	 * - `'dark'` - Always use dark mode.
	 * - `'system'` - Follow the OS color scheme preference.
	 */
	colorScheme?: 'light' | 'dark' | 'system'

	/**
	 * Named themes for the editor.
	 */
	themes?: Partial<TLThemes>

	/**
	 * The id of the initially active theme. Defaults to `'default'`.
	 */
	initialTheme?: TLThemeId

	/**
	 * Camera options for the editor.
	 *
	 * @deprecated Use `options.cameraOptions` instead. This will be removed in a future release.
	 */
	cameraOptions?: Partial<TLCameraOptions>

	/**
	 * Options for the editor.
	 */
	options?: Partial<SvelteDrawOptions>

	/**
	 * Text options for the editor.
	 *
	 * @deprecated Use `options.text` instead. This prop will be removed in a future release.
	 */
	textOptions?: TLTextOptions

	/**
	 * The license key.
	 */
	licenseKey?: string

	/**
	 * Options for syncing the editor's camera state with the URL.
	 *
	 * @deprecated Use `options.deepLinks` instead. This prop will be removed in a future release.
	 */
	deepLinks?: true | TLDeepLinkOptions

	/**
	 * Provides a way to hide shapes.
	 *
	 * Hidden shapes will not render in the editor, and they will not be eligible for hit test via
	 * `Editor.getShapeAtPoint` and `Editor.getShapesAtPoint`. But otherwise they will remain in the
	 * store and participate in all other operations.
	 *
	 * @example
	 * ```ts
	 * getShapeVisibility={(shape, editor) => shape.meta.hidden ? 'hidden' : 'inherit'}
	 * ```
	 *
	 * - `'inherit' | undefined` - (default) The shape will be visible unless its parent is hidden.
	 * - `'hidden'` - The shape will be hidden.
	 * - `'visible'` - The shape will be visible.
	 *
	 * @param shape - The shape to check.
	 * @param editor - The editor instance.
	 */
	getShapeVisibility?(
		shape: TLShape,
		editor: Editor
	): 'visible' | 'hidden' | 'inherit' | null | undefined

	/**
	 * The URLs for the fonts to use in the editor.
	 */
	assetUrls?: { fonts?: { [key: string]: string | undefined } }

	/**
	 * An i18n adapter for translating strings.
	 */
	i18n?: TLI18nAdapter
}

/**
 * The union of every prop the editor reads, regardless of which store variant was passed. The
 * editor's internal components take this shape so they can read store options without narrowing.
 *
 * @internal
 */
export type SvelteDrawEditorAllProps = SvelteDrawEditorBaseProps &
	Partial<Omit<SvelteDrawEditorWithoutStoreProps, 'store'>> & {
		store?: TLStore | TLStoreWithStatus
	}

declare global {
	interface Window {
		svelteDrawReady: boolean
	}
}

/** @public */
export interface LoadingScreenProps {
	children: Snippet
}
