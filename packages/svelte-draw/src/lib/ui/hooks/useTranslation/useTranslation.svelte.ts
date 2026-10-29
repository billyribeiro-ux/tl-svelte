import { type TLI18nMessage, getDeclaredMessages, warnOnce } from '@svelte-draw/editor'
import { fromComputed } from '@svelte-draw/svelte'
import type { Snippet } from 'svelte'
// Nothing renders these, so nothing else imports them, and an app looks them up by key. Imported
// so their English is declared — see `getDeclaredMessages`.
import '../../consumerMessages'
import type { TLUiAssetUrls } from '../../assetUrls'
import { defineUiContext } from '../../context/uiContext'
import { formatUiMessage, type UiMessageCatalog } from './intl'
import { type TLUiTranslationKey } from './TLUiTranslationKey'
import { EN_TRANSLATION, type TLUiTranslation, fetchTranslation } from './translations'

/** @public */
export interface TLUiTranslationProviderProps {
	children: Snippet
	locale: string
	/**
	 * A collection of overrides different locales.
	 *
	 * @example
	 *
	 * ```svelte
	 * <SvelteDrawUiTranslationProvider overrides={{ en: { 'style-panel.styles': 'Properties' } }} />
	 * ```
	 */
	overrides?: Record<string, Record<string, string>>
}

/**
 * What the translation context holds. Replaces the React context value (a bare `TLUiTranslation`)
 * with a reactive holder: `current` is the loaded catalog merged with the declared English and the
 * overrides, and `locale` is the requested locale, which differs from `current.locale` while a
 * catalog is in flight and for a locale the SDK ships none for.
 *
 * @public
 */
export interface TLUiTranslationContextType {
	readonly current: TLUiTranslation
	readonly locale: string
}

const translationContext = defineUiContext<TLUiTranslationContextType>('svelte-draw.ui.translation')

/** @internal */
export function setCurrentTranslation(holder: TLUiTranslationContextType): void {
	translationContext.set(holder)
}

/**
 * Replaces `useCurrentTranslation`. Returns the reactive translation holder. Throws outside a
 * provider.
 *
 * @public
 */
export function getCurrentTranslation(): TLUiTranslationContextType {
	return translationContext.get(
		'getCurrentTranslation must be used inside of <SvelteDrawUiContextProvider />'
	)
}

/**
 * Like {@link getCurrentTranslation}, but returns `null` instead of throwing when used outside
 * of a `<SvelteDrawUiTranslationProvider />` / `<SvelteDrawUiContextProvider />`. Replaces
 * `useMaybeCurrentTranslation`.
 *
 * @public
 */
export function tryGetCurrentTranslation(): TLUiTranslationContextType | null {
	return translationContext.tryGet()
}

/**
 * The reactive state behind a `SvelteDrawUiTranslationProvider`. Fetches the locale's catalog
 * ({@link TranslationState.load}, run from an effect) and derives the merged catalog.
 *
 * @internal
 */
export class TranslationState implements TLUiTranslationContextType {
	#loaded = $state.raw<TLUiTranslation>(EN_TRANSLATION)
	// Messages declared after mount (a lazily loaded chunk) have to show up, so this is a signal.
	#declared = fromComputed('declared messages', getDeclaredMessages)
	#getLocale: () => string
	#getOverrides: () => Record<string, Record<string, string>> | undefined
	#getAssetUrls: () => TLUiAssetUrls

	constructor(
		getLocale: () => string,
		getOverrides: () => Record<string, Record<string, string>> | undefined,
		getAssetUrls: () => TLUiAssetUrls
	) {
		this.#getLocale = getLocale
		this.#getOverrides = getOverrides
		this.#getAssetUrls = getAssetUrls
	}

	get locale() {
		return this.#getLocale()
	}

	// Keyed on the requested locale, not the loaded one. They differ when the SDK ships no catalogue
	// for it and `fetchTranslation` falls back to English — which is the case for a locale that
	// exists only in an app's own strings, so that's exactly when its overrides have to apply.
	//
	// Lowest to highest: the declared English, the English overrides, the locale's catalog, its
	// overrides. The English overrides go underneath the catalog, so they reach only ids it lacks:
	// an app's own key not yet translated for this locale falls back to its English, not its id.
	#translated = $derived.by(() => {
		const locale = this.#getLocale()
		const overrides = this.#getOverrides()
		const enOverrides = locale === 'en' ? undefined : overrides?.en
		return { ...enOverrides, ...this.#loaded.messages, ...overrides?.[locale] }
	})

	#current = $derived<TLUiTranslation>({
		...this.#loaded,
		messages: { ...this.#declared.current, ...this.#translated } as TLUiTranslation['messages'],
	})

	get current() {
		return this.#current
	}

	/**
	 * Fetches the catalog for the current locale. Only the fetch belongs in an effect; merging
	 * overrides is derived from data already in hand. Returns the cleanup for the effect.
	 */
	load(): () => void {
		const locale = this.#getLocale()
		const assetUrls = this.#getAssetUrls()
		let isCancelled = false

		fetchTranslation(locale, assetUrls).then((translation) => {
			if (isCancelled) return
			this.#loaded = translation
		})

		return () => {
			isCancelled = true
		}
	}
}

/**
 * Values substituted into a message's ICU placeholders.
 *
 * @public
 */
export type TLUiTranslationValues = Record<
	string,
	string | number | bigint | boolean | Date | null | undefined
>

/**
 * Returns a function to translate a message into a string based on the current translation.
 * Replaces `useTranslation`. Call it during component initialisation; the returned function reads
 * the reactive translation each time it is called, so `{msg('key')}` in a template follows the
 * locale.
 *
 * Pass a message declared with `defineMessages`, or a translation key. Messages are
 * {@link https://unicode-org.github.io/icu/userguide/format_parse/messages/ | ICU MessageFormat},
 * so a message can pluralise or select on the values you pass it. A declared message missing from
 * the catalog falls back to its `defaultMessage`; an unknown key is returned as-is.
 *
 * @example
 *
 * ```ts
 * const messages = defineMessages({
 * 	selected: { id: 'my-app.selected', defaultMessage: '{count, plural, one {# shape} other {# shapes}}' },
 * })
 *
 * const msg = getTranslation()
 * const label = msg(messages.selected, { count: 5 })
 * const title = msg('my-app.title')
 * ```
 *
 * @public
 */
export function getTranslation() {
	const holder = tryGetCurrentTranslation()

	if (!holder?.current.messages) {
		warnOnce(
			'No translation messages found, falling back to default translation. Wrap your app in <SvelteDrawUiContextProvider>, or in both <AssetUrlsProvider> and <SvelteDrawUiTranslationProvider>, to provide translations.'
		)
	}

	return function msg(
		message?: Exclude<string, TLUiTranslationKey> | string | TLI18nMessage,
		values?: TLUiTranslationValues
	): string {
		// `formatMessage` needs an id. Callers pass optional labels straight through, so keep the
		// nullish passthrough this has always had rather than substituting an empty string.
		if (!message) return message as string
		// `TranslationsContext` on its own has always been enough to translate — tests and hand-rolled
		// setups provide it without the rest. Without any provider, format against the declared
		// English rather than silently failing.
		const messages = holder?.current.messages ?? getDeclaredMessages()
		const locale = holder?.locale ?? 'en'
		// A bare key carries no default message, by design: this is the path for labels that
		// arrive as data and for an app's own keys.
		return formatUiMessage(
			locale,
			messages as UiMessageCatalog,
			typeof message === 'string' ? { id: message } : message,
			values
		)
	}
}

/**
 * Returns the current text direction ('ltr' or 'rtl') based on the current translation, as a
 * reactive holder. Replaces `useDirection`.
 *
 * @public
 */
export function getDirection(): { readonly current: 'ltr' | 'rtl' } {
	const holder = tryGetCurrentTranslation()
	return {
		get current() {
			return holder?.current.dir ?? 'ltr'
		},
	}
}

export function untranslated(string: string) {
	return string as TLUiTranslationKey
}
