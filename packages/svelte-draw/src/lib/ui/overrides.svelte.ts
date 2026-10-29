import { Editor, objectMapEntries } from '@svelte-draw/editor'
import { tryGetEditor } from '@svelte-draw/svelte'
import { PORTRAIT_BREAKPOINT } from './constants'
import type { ActionsProviderProps, TLUiActionsContextType } from './context/actions.svelte'
import { getBreakpoint } from './context/breakpoints'
import { getDialogs } from './context/dialogs'
import { getToasts } from './context/toasts'
import { defineUiContext } from './context/uiContext'
import { getLocalFiles } from './getLocalFiles'
import { getMenuClipboardEvents } from './hooks/useClipboardEvents.svelte'
import { getCopyAs } from './hooks/useCopyAs'
import { getExportAs } from './hooks/useExportAs'
import { getEmbedDefinition } from './hooks/useGetEmbedDefinition'
import { getPrint } from './hooks/usePrint'
import type { TLUiToolsContextType, TLUiToolsProviderProps } from './hooks/useTools.svelte'
import type { TLUiTranslationProviderProps } from './hooks/useTranslation/useTranslation.svelte'
import { getTranslation } from './hooks/useTranslation/useTranslation.svelte'

/**
 * Supported mime types for media files. Replaces `MimeTypeContext` with a reactive holder.
 *
 * @internal
 */
const mimeTypeContext = defineUiContext<{ readonly current: string[] | undefined }>(
	'svelte-draw.ui.mime-types'
)

/** @internal */
export function setMimeTypes(holder: { readonly current: string[] | undefined }): void {
	mimeTypeContext.set(holder)
}

/**
 * Builds the default helpers handed to action, tool and translation overrides. Replaces
 * `useDefaultHelpers`. Call during component initialisation, inside the toasts, dialogs,
 * translation, breakpoint and (optionally) editor contexts.
 *
 * Every property keeps its React meaning; `isMobile` is a live getter instead of a snapshot,
 * because the breakpoint is the one input that changes at runtime.
 *
 * @public
 */
export function createDefaultHelpers() {
	const editor = tryGetEditor()
	const { addToast, removeToast, clearToasts } = getToasts()
	const { addDialog, clearDialogs, removeDialog } = getDialogs()

	const msg = getTranslation()
	const printSelectionOrPages = getPrint()
	const { cut, copy, paste } = getMenuClipboardEvents()
	const copyAs = getCopyAs()
	const exportAs = getExportAs()
	const embedDefinition = getEmbedDefinition()

	// This is the only one that will change during runtime
	const breakpoint = getBreakpoint()
	const mimeTypes = mimeTypeContext.tryGet()

	const insertMedia = async () => {
		if (!editor) return
		const files = await getLocalFiles({
			allowMultiple: true,
			mimeTypes: mimeTypes?.current,
			document: editor.getContainerDocument(),
		})
		if (!files.length) return
		editor.markHistoryStoppingPoint('insert media')
		editor.putExternalContent({
			type: 'files',
			files,
			point: editor.getViewportPageBounds().center,
		})
	}

	const replaceMedia = async (isImage: boolean) => {
		if (!editor) return
		const files = await getLocalFiles({
			allowMultiple: false,
			mimeTypes: mimeTypes?.current?.filter((m) =>
				isImage ? m.startsWith('image/') : m.startsWith('video/')
			),
			document: editor.getContainerDocument(),
		})
		if (!files.length) return
		const shape = editor.getOnlySelectedShape()
		if (!shape || (isImage && shape.type !== 'image') || (!isImage && shape.type !== 'video'))
			return

		editor.markHistoryStoppingPoint('replace media')

		const file = files[0]
		editor.replaceExternalContent({
			type: 'file-replace',
			file,
			shapeId: shape.id,
			isImage,
		})
	}

	const replaceImage = () => replaceMedia(true /* isImage */)
	const replaceVideo = () => replaceMedia(false /* isImage */)

	return {
		addToast,
		removeToast,
		clearToasts,
		addDialog,
		removeDialog,
		clearDialogs,
		msg,
		get isMobile() {
			return breakpoint.current < PORTRAIT_BREAKPOINT.TABLET_SM
		},
		insertMedia,
		replaceImage,
		replaceVideo,
		printSelectionOrPages,
		cut,
		copy,
		paste,
		copyAs,
		exportAs,
		getEmbedDefinition: embedDefinition,
	}
}

/** @public */
export type TLUiOverrideHelpers = ReturnType<typeof createDefaultHelpers>

/** @public */
export interface TLUiOverrides {
	/**
	 * The `actions` passed in aren't gated yet: calling one's `onSelect` here skips the readonly
	 * check, `isAvailable` and `isEnabled`.
	 */
	actions?(
		editor: Editor,
		actions: TLUiActionsContextType,
		helpers: TLUiOverrideHelpers
	): TLUiActionsContextType
	tools?(
		editor: Editor,
		tools: TLUiToolsContextType,
		helpers: TLUiOverrideHelpers
	): TLUiToolsContextType
	translations?: TLUiTranslationProviderProps['overrides']
}

export interface TLUiOverridesWithoutDefaults {
	actions?: ActionsProviderProps['overrides']
	tools?: TLUiToolsProviderProps['overrides']
	translations?: TLUiTranslationProviderProps['overrides']
}

function mergeTranslationOverrides(
	overrides: TLUiOverrides[]
): NonNullable<TLUiTranslationProviderProps['overrides']> {
	const mergedTranslations: NonNullable<TLUiTranslationProviderProps['overrides']> = {}
	for (const override of overrides) {
		if (override.translations) {
			for (const [key, value] of objectMapEntries(override.translations)) {
				let strings = mergedTranslations[key]
				if (!strings) {
					strings = mergedTranslations[key] = {}
				}
				Object.assign(strings, value)
			}
		}
	}
	return mergedTranslations
}

function toOverridesArray(overrides?: TLUiOverrides[] | TLUiOverrides): TLUiOverrides[] {
	return overrides == null ? [] : Array.isArray(overrides) ? overrides : [overrides]
}

export function mergeOverrides(
	overrides: TLUiOverrides[],
	defaultHelpers: TLUiOverrideHelpers
): TLUiOverridesWithoutDefaults {
	return {
		actions: (editor, schema, helpers) => {
			for (const override of overrides) {
				if (override.actions) {
					schema = override.actions(editor, schema, helpers)
				}
			}
			return schema
		},
		tools: (editor, schema, helpers) => {
			for (const override of overrides) {
				if (override.tools) {
					schema = override.tools(editor, schema, { ...defaultHelpers, ...helpers })
				}
			}
			return schema
		},
		translations: mergeTranslationOverrides(overrides),
	}
}

/**
 * Replaces `useMergedTranslationOverrides`: a reactive holder of the merged translation overrides.
 *
 * @internal
 */
export function createMergedTranslationOverrides(
	getOverrides: () => TLUiOverrides[] | TLUiOverrides | undefined
): { readonly current: NonNullable<TLUiTranslationProviderProps['overrides']> } {
	const merged = $derived(mergeTranslationOverrides(toOverridesArray(getOverrides())))
	return {
		get current() {
			return merged
		},
	}
}

/**
 * Replaces `useMergedOverrides`: a reactive holder of the merged overrides. Call during component
 * initialisation (it builds the default helpers).
 *
 * @internal
 */
export function createMergedOverrides(
	getOverrides: () => TLUiOverrides[] | TLUiOverrides | undefined
): { readonly current: TLUiOverridesWithoutDefaults } {
	const defaultHelpers = createDefaultHelpers()
	const merged = $derived(mergeOverrides(toOverridesArray(getOverrides()), defaultHelpers))
	return {
		get current() {
			return merged
		},
	}
}
