import { IntlMessageFormat } from 'intl-messageformat'
import { getContext, setContext } from 'svelte'

/*
 * The slice of `react-intl` the app used, over `intl-messageformat` (which `react-intl` itself
 * formats with) and the platform `Intl` objects.
 *
 *   react-intl                      here
 *   -----------------------------   ----------------------------------------------------
 *   <IntlProvider>                  <IntlProvider> (./IntlProvider.svelte)
 *   useIntl()                       getIntl() -> { current: Intl }
 *   createIntl({...})               createIntl({...})
 *   <FormattedMessage>              <FormattedMessage> (./FormattedMessage.svelte)
 *   <FormattedRelativeTime>         <FormattedRelativeTime> (./FormattedRelativeTime.svelte)
 *   intl.formatMessage(d, values)   intl.formatMessage(d, values)
 *   intl.formatDate / formatNumber  intl.formatDate / formatNumber
 *
 * `formatMessage` follows the lookup rules `react-intl` inherited from `@formatjs/intl`, the same
 * ones the SDK's `getTranslation()` applies:
 *
 * 1. A message in the catalog under `descriptor.id` wins ('' is a real message).
 * 2. Otherwise `descriptor.defaultMessage`, formatted as English.
 * 3. Otherwise the id.
 * 4. A message that fails to format falls back to the default message, then to the raw string, then
 *    to the id. A missing translation is never reported.
 *
 * Messages are ICU strings or precompiled ASTs (`@formatjs/unplugin` with `ast: true` compiles the
 * `defaultMessage` of every `defineMessages` entry in this app).
 */

type MessageFormatElement = Exclude<
	ConstructorParameters<typeof IntlMessageFormat>[0],
	string
>[number]

export type IntlMessage = string | MessageFormatElement[]
export type IntlMessages = Record<string, IntlMessage>

export interface IntlMessageDescriptor {
	id?: string | number
	defaultMessage?: IntlMessage
	description?: string
}

export type IntlMessageValues = Record<string, unknown>

const DEFAULT_LOCALE = 'en'

export interface Intl {
	readonly locale: string
	readonly messages: IntlMessages
	formatMessage(descriptor: IntlMessageDescriptor, values?: IntlMessageValues): string
	formatDate(value: Date | number | string, options?: Intl.DateTimeFormatOptions): string
	formatNumber(value: number | bigint, options?: Intl.NumberFormatOptions): string
	formatRelativeTime(
		value: number,
		unit?: Intl.RelativeTimeFormatUnit,
		options?: Intl.RelativeTimeFormatOptions
	): string
}

const formatCache = new Map<string, IntlMessageFormat>()

function getMessageFormat(message: IntlMessage, locale: string) {
	// ASTs are compiled by the build, the objects are not worth keying a cache on.
	if (typeof message !== 'string') return new IntlMessageFormat(message, locale)
	const key = `${locale}\u0000${message}`
	let mf = formatCache.get(key)
	if (!mf) {
		mf = new IntlMessageFormat(message, locale)
		formatCache.set(key, mf)
	}
	return mf
}

function reportError(error: unknown, id: string) {
	if (process.env.NODE_ENV !== 'production') {
		console.error(`[intl] Error formatting message "${id}"`, error)
	}
}

function join(out: unknown): string {
	return Array.isArray(out) ? out.join('') : String(out)
}

/** @internal exported for the unit test */
export function formatDescriptor(
	locale: string,
	messages: IntlMessages,
	descriptor: IntlMessageDescriptor,
	values?: IntlMessageValues
): string {
	const id = String(descriptor.id)
	const { defaultMessage } = descriptor
	const message = Object.prototype.hasOwnProperty.call(messages, id) ? messages[id] : undefined

	if (!message) {
		// '' is a real (hiding) message; the other falsy value is a missing one.
		if (message === '') return ''
		if (defaultMessage) {
			try {
				return join(getMessageFormat(defaultMessage, DEFAULT_LOCALE).format(values as never))
			} catch (e) {
				reportError(e, id)
				return typeof defaultMessage === 'string' ? defaultMessage : id
			}
		}
		return id
	}

	try {
		return join(getMessageFormat(message, locale).format(values as never))
	} catch (e) {
		reportError(e, id)
	}
	if (defaultMessage) {
		try {
			return join(getMessageFormat(defaultMessage, DEFAULT_LOCALE).format(values as never))
		} catch (e) {
			reportError(e, id)
		}
	}
	if (typeof message === 'string') return message
	if (typeof defaultMessage === 'string') return defaultMessage
	return id
}

export function createIntl({
	locale,
	messages = {},
}: {
	locale: string
	messages?: IntlMessages
}): Intl {
	return {
		locale,
		messages,
		formatMessage: (descriptor, values) => formatDescriptor(locale, messages, descriptor, values),
		formatDate: (value, options) =>
			new Intl.DateTimeFormat(locale, options).format(new Date(value)),
		formatNumber: (value, options) => new Intl.NumberFormat(locale, options).format(value),
		formatRelativeTime: (value, unit = 'second', options) =>
			new Intl.RelativeTimeFormat(locale, options).format(value, unit),
	}
}

const INTL_KEY = Symbol('dotcom.intl')

/** What `getIntl()` reads. A holder, because the locale and its catalog change over time. */
export interface IntlHolder {
	readonly current: Intl
}

/** Call during component initialisation. {@link IntlProvider} calls this for you. */
export function setIntl(holder: IntlHolder) {
	setContext(INTL_KEY, holder)
}

/**
 * `useIntl()`. Throws outside of an `<IntlProvider>`. Read `.current` where you format, so a locale
 * change is followed.
 */
export function getIntl(): IntlHolder {
	const holder = getContext<IntlHolder | undefined>(INTL_KEY)
	if (!holder) throw new Error('getIntl must be used inside of an <IntlProvider>')
	return holder
}

/** Like {@link getIntl} but `null` outside a provider. */
export function tryGetIntl(): IntlHolder | null {
	return getContext<IntlHolder | undefined>(INTL_KEY) ?? null
}
