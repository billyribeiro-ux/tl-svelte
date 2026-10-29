import { IntlMessageFormat } from 'intl-messageformat'

/** A precompiled ICU message (`@formatjs/icu-messageformat-parser` AST). */
type MessageFormatElement = Exclude<
	ConstructorParameters<typeof IntlMessageFormat>[0],
	string
>[number]

/**
 * The message formatter behind `getTranslation()`, `<F>` and `getSvelteDrawI18n()`. It reproduces
 * the lookup rules of `@formatjs/intl`'s `formatMessage` (which `react-intl` delegated to), line
 * for line, on top of `intl-messageformat`, so message-id lookup and fallbacks behave as before:
 *
 * 1. A message in the catalog under `descriptor.id` wins. An empty string is a valid message (it
 *    is how an app hides a label), so `''` is returned as is.
 * 2. Otherwise the descriptor's `defaultMessage` is formatted with the default locale (`en`).
 * 3. Otherwise the id itself is returned (apps pass their own keys and plain text through `msg`).
 * 4. A message that fails to format falls back to the default message, then to the raw message
 *    string, then to the id.
 *
 * A missing translation is never reported. Any other failure is logged outside production.
 *
 * @internal
 */

/** The catalog: ICU strings, or precompiled ICU ASTs. */
export type UiMessageCatalog = Record<string, string | MessageFormatElement[]>

/** @internal */
export interface UiMessageDescriptor {
	id: string
	defaultMessage?: string
}

/** @internal */
export type UiMessageValues = Record<string, unknown>

const DEFAULT_LOCALE = 'en'

const cache = new Map<string, IntlMessageFormat>()

function getMessageFormat(message: string | MessageFormatElement[], locale: string) {
	if (typeof message !== 'string') return new IntlMessageFormat(message, locale)
	const key = `${locale}\u0000${message}`
	let mf = cache.get(key)
	if (!mf) {
		mf = new IntlMessageFormat(message, locale)
		cache.set(key, mf)
	}
	return mf
}

function reportError(error: unknown, id: string) {
	if (process.env.NODE_ENV !== 'production') {
		console.error(`[svelte-draw intl] Error formatting message "${id}"`, error)
	}
}

/** @internal */
export function resolveUiMessage<T>(
	locale: string,
	messages: UiMessageCatalog | undefined,
	descriptor: UiMessageDescriptor,
	format: (mf: IntlMessageFormat) => T,
	literal: (text: string) => T
): T {
	const id = String(descriptor.id)
	const { defaultMessage } = descriptor
	const message = messages && Object.prototype.hasOwnProperty.call(messages, id) && messages[id]

	if (Array.isArray(message) && message.length === 1 && message[0].type === 0 /* literal */) {
		return literal((message[0] as { value: string }).value)
	}

	if (!message) {
		// `fallbackOnEmptyString` is off: '' is a real (hiding) override.
		if (message === '') return literal('')
		if (defaultMessage) {
			try {
				return format(getMessageFormat(defaultMessage, DEFAULT_LOCALE))
			} catch (e) {
				reportError(e, id)
				return literal(defaultMessage)
			}
		}
		return literal(id)
	}

	try {
		return format(getMessageFormat(message, locale))
	} catch (e) {
		reportError(e, id)
	}
	if (defaultMessage) {
		try {
			return format(getMessageFormat(defaultMessage, DEFAULT_LOCALE))
		} catch (e) {
			reportError(e, id)
		}
	}
	if (typeof message === 'string') return literal(message)
	if (typeof defaultMessage === 'string') return literal(defaultMessage)
	return literal(id)
}

/** @internal */
export function formatUiMessage(
	locale: string,
	messages: UiMessageCatalog | undefined,
	descriptor: UiMessageDescriptor,
	values?: UiMessageValues
): string {
	return resolveUiMessage(
		locale,
		messages,
		descriptor,
		(mf) => {
			const out = mf.format(values as never) as unknown
			return Array.isArray(out) ? out.join('') : String(out)
		},
		(text) => text
	)
}

/**
 * Like {@link formatUiMessage}, but keeps non-string values (what a tag function or an object
 * value returned) as separate parts, so a component can render them.
 *
 * @internal
 */
export function formatUiMessageToParts(
	locale: string,
	messages: UiMessageCatalog | undefined,
	descriptor: UiMessageDescriptor,
	values?: UiMessageValues
): unknown[] {
	return resolveUiMessage<unknown[]>(
		locale,
		messages,
		descriptor,
		(mf) => {
			const parts = mf.formatToParts(values as never) as { type: number; value: unknown }[]
			return parts.map((part) => part.value)
		},
		(text) => [text]
	)
}
