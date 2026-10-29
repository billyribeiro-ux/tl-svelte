/**
 * The UI context layer. Every React provider became a Svelte component (or a pair of
 * `create*`/`set*` helpers) that calls `setContext`, and every `use*` reader became a `get*`
 * function that must be called during component initialisation.
 *
 * | React                                  | Svelte                                                              |
 * | -------------------------------------- | ------------------------------------------------------------------- |
 * | `useA11y()`                            | `getA11y()`                                                         |
 * | `SvelteDrawUiA11yProvider`             | `SvelteDrawUiA11yProvider.svelte` (`setA11y(createA11y())`)         |
 * | `useActions()`                         | `getActions()` (stable object, live property reads; see its docs)   |
 * | `ActionsProvider`                      | `setActions(createActions(() => overrides))`                        |
 * | `ContextMenuPagePointContext`          | `getContextMenuPagePoint()` -> `{ current: Vec \| null }`           |
 * | `useAssetUrls()`                       | `getAssetUrls()` (value) / `getAssetUrlsHolder()` (`{ current }`)   |
 * | `AssetUrlsProvider`                    | `AssetUrlsProvider.svelte`                                          |
 * | `useBreakpoint()` (a number)           | `getBreakpoint()` -> `{ current: number }`                          |
 * | `BreakPointProvider`                   | `BreakPointProvider.svelte`                                         |
 * | `useSvelteDrawUiComponents()`          | `getUiComponents()` (live getters; destructuring takes a snapshot)  |
 * | `SvelteDrawUiComponentsProvider`       | `SvelteDrawUiComponentsProvider.svelte`                             |
 * | `useDialogs()`                         | `getDialogs()`                                                      |
 * | `SvelteDrawUiDialogsProvider`          | `SvelteDrawUiDialogsProvider.svelte`                                |
 * | `useUiEvents()`                        | `getUiEvents()`                                                     |
 * | `SvelteDrawUiEventsProvider`           | `SvelteDrawUiEventsProvider.svelte`                                 |
 * | `useToasts()`                          | `getToasts()`                                                       |
 * | `SvelteDrawUiToastsProvider`           | `SvelteDrawUiToastsProvider.svelte` (no Radix `Toast.Provider`)     |
 * | `useTranslation()`                     | `getTranslation()` -> `msg(key \| descriptor, values?)`             |
 * | `useCurrentTranslation()`              | `getCurrentTranslation()` -> `{ current: TLUiTranslation, locale }` |
 * | `useMaybeCurrentTranslation()`         | `tryGetCurrentTranslation()` (`null` outside a provider)            |
 * | `useDirection()`                       | `getDirection()` -> `{ current: 'ltr' \| 'rtl' }`                   |
 * | `SvelteDrawUiTranslationProvider`      | `SvelteDrawUiTranslationProvider.svelte`                            |
 * | `useSvelteDrawI18n()`                  | `getSvelteDrawI18n()`                                               |
 * | `<F>`                                  | `F.svelte` (`elements` / `tags` snippets instead of element values) |
 * | `SvelteDrawUiContextProvider`          | `SvelteDrawUiContextProvider.svelte`                                |
 * | `useDefaultHelpers()`                  | `createDefaultHelpers()` (in `ui/overrides.svelte.ts`)              |
 * | `useTools()` / `ToolsProvider`         | `getTools()` / `setupTools()` (in `ui/hooks/useTools.svelte.ts`)    |
 *
 * `getX()` throws outside its provider, `tryGetX()` returns `null`. Where a value changes over
 * time the reader returns a `{ current }` holder: read `.current` inside `$derived`, `$effect` or
 * the template.
 */

export {
	createA11y,
	getA11y,
	setA11y,
	tryGetA11y,
	type A11yPriority,
	type A11yProviderProps,
	type TLUiA11y,
	type TLUiA11yContextType,
} from './a11y'
export {
	canApplySelectionAction,
	canApplyToUnlockedSelection,
	canFitFrameToContent,
	canFlatten,
	canFlipSelection,
	canFrameSelection,
	canReadClipboard,
	canToggleAutoSize,
	canWriteClipboard,
	areAllSelectedFrameLike,
	areAllSelectedFrames,
	getUnlockedSelectedShapes,
	hasDownloadableMediaSelected,
	hasLinkShapeSelected,
	hasLockedShapesOnPage,
	hasShapesOnPage,
	hasThreeStackableShapes,
	hasUnlockedSelection,
	isContentOffscreen,
	isGroupAllowed,
	isOnlyEmbeddableBookmarkSelected,
	isOnlyEmbedWithUrlSelected,
	isOnlyFlippableShapeSelected,
	isUngroupAllowed,
	supportsDownloadingOriginal,
} from './action-predicates'
export { getActionState, isActionRunnable, type TLUiActionState } from './action-state'
export {
	createActions,
	gateActions,
	getActions,
	getContextMenuPagePoint,
	setActions,
	unwrapLabel,
	type ActionsProviderProps,
	type TLUiActionItem,
	type TLUiActionsContextType,
	type TLUiActionsHolder,
} from './actions.svelte'
export {
	getAssetUrls,
	getAssetUrlsHolder,
	preloadAssetUrls,
	setAssetUrls,
	tryGetAssetUrlsHolder,
	type AssetUrlsProviderProps,
} from './asset-urls'
export {
	computeBreakpoint,
	getBreakpoint,
	setBreakpoint,
	type BreakPointProviderProps,
} from './breakpoints'
export {
	createUiComponents,
	getUiComponents,
	setUiComponents,
	type TLUiComponents,
	type TLUiComponentsProviderProps,
} from './components'
export {
	createDialogs,
	getDialogs,
	setDialogs,
	tryGetDialogs,
	type TLUiDialog,
	type TLUiDialogProps,
	type TLUiDialogsContextType,
	type TLUiDialogsProviderProps,
} from './dialogs'
export {
	getUiEvents,
	setUiEvents,
	type EventsProviderProps,
	type TLUiEventContextType,
	type TLUiEventData,
	type TLUiEventHandler,
	type TLUiEventMap,
	type TLUiEventSource,
} from './events'
export { getSvelteDrawI18n, type TLUiMessageProps, type TLUiMessageValues } from './i18n'
export {
	createToasts,
	getToasts,
	setToasts,
	tryGetToasts,
	type AlertSeverity,
	type TLUiToast,
	type TLUiToastAction,
	type TLUiToastsContextType,
	type TLUiToastsProviderProps,
} from './toasts'
export { defineUiContext } from './uiContext'

export { default as AssetUrlsProvider } from './AssetUrlsProvider.svelte'
export { default as BreakPointProvider } from './BreakPointProvider.svelte'
export { default as F } from './F.svelte'
export { default as SvelteDrawUiA11yProvider } from './SvelteDrawUiA11yProvider.svelte'
export { default as SvelteDrawUiComponentsProvider } from './SvelteDrawUiComponentsProvider.svelte'
export {
	default as SvelteDrawUiContextProvider,
	type TLUiContextProviderProps,
} from './SvelteDrawUiContextProvider.svelte'
export { default as SvelteDrawUiDialogsProvider } from './SvelteDrawUiDialogsProvider.svelte'
export { default as SvelteDrawUiEventsProvider } from './SvelteDrawUiEventsProvider.svelte'
export { default as SvelteDrawUiToastsProvider } from './SvelteDrawUiToastsProvider.svelte'

// Translation: lives in hooks/useTranslation, re-exported here because the contract lists it with
// the contexts (`getTranslation` and friends are context readers).
export {
	getCurrentTranslation,
	getDirection,
	getTranslation,
	setCurrentTranslation,
	TranslationState,
	tryGetCurrentTranslation,
	untranslated,
	type TLUiTranslationContextType,
	type TLUiTranslationProviderProps,
	type TLUiTranslationValues,
} from '../hooks/useTranslation/useTranslation.svelte'
export { default as SvelteDrawUiTranslationProvider } from '../hooks/useTranslation/SvelteDrawUiTranslationProvider.svelte'
export {
	EN_TRANSLATION,
	RTL_LANGUAGES,
	fetchTranslation,
	type TLUiTranslation,
} from '../hooks/useTranslation/translations'
export type { TLUiTranslationKey } from '../hooks/useTranslation/TLUiTranslationKey'
