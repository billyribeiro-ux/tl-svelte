import type { TLI18nAdapter } from '@svelte-draw/editor'
import { getContext, setContext } from 'svelte'

/** @internal */
export interface EditorI18nFallback {
	current: TLI18nAdapter | null
}

const I18N_FALLBACK_KEY = Symbol('svelte-draw.editor-i18n-fallback')

/**
 * A slot the UI fills with its own i18n, for an editor whose host passed none. Every app that
 * composes `<SvelteDrawEditor>` and `<SvelteDrawUi>` by hand rather than rendering `<SvelteDraw>` is
 * one: the `i18n` prop is new, so none of them pass it, and their shape names, which shapes now
 * resolve through the editor's i18n, would have been announced in English. The UI renders inside the
 * editor in every composition, so it can hand its translations up. An `i18n` prop still wins.
 *
 * `<SvelteDraw>` relies on this too, rather than passing a prop: the translation provider it
 * renders above the editor has its locale fixed at mount, so an adapter read from there kept
 * announcing shapes in the first language after the user switched.
 *
 * @internal
 */
export function setEditorI18nFallback(fallback: EditorI18nFallback): void {
	setContext(I18N_FALLBACK_KEY, fallback)
}

/** @internal Returns `null` outside of an editor. */
export function tryGetEditorI18nFallback(): EditorI18nFallback | null {
	return getContext<EditorI18nFallback | undefined>(I18N_FALLBACK_KEY) ?? null
}
