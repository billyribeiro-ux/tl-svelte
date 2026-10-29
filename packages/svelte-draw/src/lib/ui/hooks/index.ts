/**
 * UI hooks, ported from React hooks to Svelte 5 utilities.
 *
 * Naming convention (all of these are called during component initialisation unless noted):
 * - `create*` builds reactive state and returns `{ current }` (or a small object with getters).
 *   Read it in a `$derived` / the template; it follows the editor's signals.
 * - `get*` reads a context or returns a callback. No reactivity of its own.
 * - `setup*` registers side effects (it uses `$effect`) or provides context to descendants.
 * - `attach*` is the framework-free core of a `setup*`: it takes explicit inputs, adds DOM listeners
 *   and returns the teardown function. Use it from a `$effect` or a `{@attach}` wrapper.
 *
 * Arguments that used to be re-evaluated on every React render (`id`, `min`, `max`, `action`, ...)
 * are accepted as getters (`() => value`) where noted so they follow reactive props.
 *
 * | React hook                      | Svelte replacement                              | File                         |
 * | ------------------------------- | ----------------------------------------------- | ---------------------------- |
 * | useActionState(action)          | createActionState(() => action) -> {current}    | useActionState.svelte.ts     |
 * | useSomeActionsEnabled(ids)      | createSomeActionsEnabled(() => ids)             | useActionState.svelte.ts     |
 * | useSomeActionsAvailable(ids)    | createSomeActionsAvailable(() => ids)           | useActionState.svelte.ts     |
 * | useShowCollaborationUi()        | getShowCollaborationUi() -> boolean             | useCollaborationStatus.ts    |
 * | useCollaborationStatus()        | createCollaborationStatus() -> {current}        | useCollaborationStatus.ts    |
 * | useCommentingEnabled()          | createCommentingEnabled() -> {current}          | useCommentingEnabled.svelte.ts |
 * | useCopyAs()                     | getCopyAs() -> (ids, format?) => void           | useCopyAs.ts                 |
 * | useExportAs()                   | getExportAs() -> (ids, opts?) => void           | useExportAs.ts               |
 * | useEditorEvents()               | setupEditorEvents()                             | useEditorEvents.svelte.ts    |
 * | useFlatten()                    | getFlatten() -> (ids) => Promise                | useFlatten.ts                |
 * | useGetEmbedShapeUtil()          | getEmbedShapeUtil()                             | useGetEmbedDefinition.ts     |
 * | useGetEmbedDefinition()         | getEmbedDefinition() -> (url) => def            | useGetEmbedDefinition.ts     |
 * | useGetEmbedDefinitions()        | getEmbedDefinitions() (read once)               | useGetEmbedDefinitions.ts    |
 * | useKeyboardShortcuts()          | setupKeyboardShortcuts() / attachKeyboardShortcuts(opts) | useKeyboardShortcuts.svelte.ts |
 * | useLocalStorageState(key, def)  | createLocalStorageState(key, def) -> {current, update} | useLocalStorageState.svelte.ts |
 * | useMenuIsOpen(id, cb)           | createMenuIsOpen(id, cb) -> {isOpen, onOpenChange} | useMenuIsOpen.ts          |
 * | usePrint()                      | getPrint() -> () => Promise<void>               | usePrint.ts                  |
 * | useReadonly()                   | createReadonly() -> {current}                   | useReadonly.ts               |
 * | useRelevantStyles(styles?)      | createRelevantStyles(styles?) -> {current}      | useRelevantStyles.ts         |
 * | useTools() / <ToolsProvider>    | getTools() -> {current} / setupTools(overrides) | useTools.svelte.ts           |
 * | useMenuClipboardEvents()        | getMenuClipboardEvents() -> {copy, cut, paste}  | useClipboardEvents.svelte.ts |
 * | useNativeClipboardEvents()      | setupNativeClipboardEvents() / attachNativeClipboardEvents(editor, trackEvent) | useClipboardEvents.svelte.ts |
 * | useAnySelectedShapesCount(...)  | createAnySelectedShapesCount(min?, max?)        | menu-hooks.ts                |
 * | useUnlockedSelectedShapesCount  | createUnlockedSelectedShapesCount(min?, max?)   | menu-hooks.ts                |
 * | useCanRedo / useCanUndo         | createCanRedo() / createCanUndo()               | menu-hooks.ts                |
 * | useHasShapesOnPage()            | createHasShapesOnPage()                         | menu-hooks.ts                |
 * | useCanApplySelectionAction()    | createCanApplySelectionAction()                 | menu-hooks.ts                |
 */

export {
	createActionState,
	createSomeActionsAvailable,
	createSomeActionsEnabled,
} from './useActionState.svelte'
export {
	attachNativeClipboardEvents,
	extractIframeFromHtml,
	getMenuClipboardEvents,
	handleNativeOrMenuCopy,
	handlePasteFromClipboardApi,
	handlePasteFromEventClipboardData,
	isValidHttpURL,
	putPastedExternalContent,
	resolvePasteModifiers,
	setupNativeClipboardEvents,
} from './useClipboardEvents.svelte'
export { pasteFiles } from './clipboard/pasteFiles'
export { pasteUrl } from './clipboard/pasteUrl'
export type { PutPastedExternalContentMeta } from './clipboard/putPastedContent'
export { createCollaborationStatus, getShowCollaborationUi } from './useCollaborationStatus'
export { createCommentingEnabled } from './useCommentingEnabled.svelte'
export { getCopyAs } from './useCopyAs'
export { setupEditorEvents } from './useEditorEvents.svelte'
export { getExportAs } from './useExportAs'
export { flattenShapesToImages, getFlatten } from './useFlatten'
export { getEmbedDefinition, getEmbedShapeUtil } from './useGetEmbedDefinition'
export { getEmbedDefinitions } from './useGetEmbedDefinitions'
export {
	areShortcutsDisabled,
	attachKeyboardShortcuts,
	getHotkeysStringFromKbd,
	parseKbd,
	setupKeyboardShortcuts,
	SKIP_KBDS,
	type KeyboardShortcutsOptions,
	type ParsedKbd,
} from './useKeyboardShortcuts.svelte'
export { createLocalStorageState } from './useLocalStorageState.svelte'
export { createMenuIsOpen } from './useMenuIsOpen'
export { getPrint } from './usePrint'
export { createReadonly } from './useReadonly'
export { createRelevantStyles } from './useRelevantStyles'
export {
	createCanApplySelectionAction,
	createCanRedo,
	createCanUndo,
	createAnySelectedShapesCount,
	createHasShapesOnPage,
	createUnlockedSelectedShapesCount,
} from './menu-hooks'
export {
	createTools,
	getTools,
	onDragFromToolbarToCreateShape,
	setTools,
	setupTools,
	TOOLS_CONTEXT_KEY,
	type OnDragFromToolbarToCreateShapesOpts,
	type TLUiToolItem,
	type TLUiToolsContextType,
	type TLUiToolsProviderProps,
} from './useTools.svelte'
