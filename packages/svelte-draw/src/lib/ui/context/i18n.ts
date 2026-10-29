import type { TLI18n, TLI18nAdapter, TLI18nMessageInput } from '@svelte-draw/editor'
import type { Snippet } from 'svelte'
import { formatUiMessage, type UiMessageCatalog } from '../hooks/useTranslation/intl'
import {
	getCurrentTranslation,
	type TLUiTranslationValues,
} from '../hooks/useTranslation/useTranslation.svelte'

/**
 * Values for a message rendered as an element. These are the same primitives a string message
 * takes.
 *
 * React's `<F>` also took elements and tag functions inside `values`. A Svelte snippet cannot be
 * told apart from a function by its type, so those move to two explicit props, {@link TLUiMessageProps.elements}
 * and {@link TLUiMessageProps.tags}. Either way the markup stays out of the string, so a
 * translator gets one whole sentence to reorder rather than fragments that can only be concatenated.
 *
 * @example
 *
 * ```svelte
 * {#snippet who(name)}<strong>{name}</strong>{/snippet}
 * {#snippet help()}<a href="/help">Need help?</a>{/snippet}
 * <F
 * 	defaultMessage="<who>{name}</who> joined. {help}"
 * 	id="example.joined"
 * 	values={{ name: 'Ada' }}
 * 	tags={{ who }}
 * 	elements={{ help }}
 * />
 * ```
 *
 * @public
 */
export type TLUiMessageValues = TLUiTranslationValues

/** @public */
export interface TLUiMessageProps extends TLI18nMessageInput {
	values?: TLUiMessageValues
	/** Snippets substituted for a `{placeholder}` of the message. */
	elements?: Record<string, Snippet<[]>>
	/** Snippets rendered for a `<tag>` of the message; they receive the text the tag encloses. */
	tags?: Record<string, Snippet<[string]>>
}

/**
 * Builds the `TLI18nAdapter` the editor hands to code that has no access to Svelte context,
 * such as a `ShapeUtil`. `<SvelteDraw />` wires this up for you; call it yourself only when composing
 * `<SvelteDrawEditor />` by hand, and from inside a `<SvelteDrawUiTranslationProvider />`.
 * Replaces `useSvelteDrawI18n`. Call during component initialisation.
 *
 * @example
 *
 * ```svelte
 * <script lang="ts">
 * 	const i18n = getSvelteDrawI18n()
 * </script>
 * <SvelteDrawEditor {i18n} />
 * ```
 *
 * @public
 */
export function getSvelteDrawI18n(): TLI18nAdapter {
	const holder = getCurrentTranslation()

	// A stable function that reads the current translation, so whatever holds the adapter — the
	// editor, or an app that stores it — never sees it change identity on a locale switch. The
	// object it returns is rebuilt on each call, so it always reflects the current locale.
	return (): TLI18n => ({
		// The requested locale, as the provider has it, not the catalog that loaded. They
		// differ while a catalog is in flight and for a locale the SDK ships none for, and either
		// way the loaded one is English — so a French user's dates formatted as English.
		locale: holder.locale,
		// The loaded catalog's, deliberately: it has to agree with `getDirection`, which lays out
		// the rest of the UI.
		dir: holder.current.dir,
		// The whole descriptor, so the formatter formats `defaultMessage` itself for an id the
		// catalog doesn't have. Given only the id it returns the id, and the English then had to
		// be substituted in verbatim — which showed a plural message's own ICU source in a toast.
		translate: (message, values) =>
			formatUiMessage(holder.locale, holder.current.messages as UiMessageCatalog, message, values),
	})
}
