import { mount, unmount } from 'svelte'
import { afterEach, describe, expect, it } from 'vitest'
import ContextHarness from './test/ContextHarness.svelte'
import { type TLUiTranslation } from './translations'
import {
	getCurrentTranslation,
	getDirection,
	getTranslation,
	tryGetCurrentTranslation,
	type TLUiTranslationContextType,
} from './useTranslation.svelte'

const catalog = {
	'action.copy': 'Copy',
	'a11y.shape-index': '{num} of {total}',
	'comments.replies': '{count, plural, one {# reply} other {# replies}}',
}

const rtlTranslation: TLUiTranslation = {
	locale: 'ar',
	label: 'Arabic',
	dir: 'rtl',
	messages: catalog as TLUiTranslation['messages'],
}

const rtlContext: TLUiTranslationContextType = { current: rtlTranslation, locale: 'ar' }

let app: ReturnType<typeof mount> | undefined
afterEach(() => {
	if (app) unmount(app)
	app = undefined
	document.body.innerHTML = ''
})

/** Runs `read` during component initialisation, inside the given translation context. */
function inContext<T>(translation: TLUiTranslationContextType | null, read: () => T): T {
	let result!: T
	app = mount(ContextHarness, {
		target: document.body,
		props: {
			translation,
			run: () => {
				result = read()
			},
		},
	})
	return result
}

describe('getCurrentTranslation', () => {
	it('returns the current translation when inside a provider', () => {
		const result = inContext(rtlContext, () => getCurrentTranslation())
		expect(result.current).toBe(rtlTranslation)
	})

	it('throws when used outside of a provider', () => {
		expect(() => inContext(null, () => getCurrentTranslation())).toThrow(
			'getCurrentTranslation must be used inside of <SvelteDrawUiContextProvider />'
		)
	})
})

describe('tryGetCurrentTranslation', () => {
	it('returns the current translation when inside a provider', () => {
		const result = inContext(rtlContext, () => tryGetCurrentTranslation())
		expect(result?.current).toBe(rtlTranslation)
	})

	it('returns null when used outside of a provider, without throwing', () => {
		expect(inContext(null, () => tryGetCurrentTranslation())).toBeNull()
	})
})

describe('getDirection', () => {
	it('returns the direction from the current translation when inside a provider', () => {
		expect(inContext(rtlContext, () => getDirection()).current).toBe('rtl')
	})

	it('falls back to "ltr" when used outside of a provider, without throwing', () => {
		expect(inContext(null, () => getDirection()).current).toBe('ltr')
	})
})

describe('getTranslation', () => {
	function msgWith(messages: Record<string, string>, locale = 'en') {
		return inContext(
			{
				locale,
				current: {
					locale,
					label: locale,
					dir: 'ltr',
					messages: { ...catalog, ...messages } as TLUiTranslation['messages'],
				},
			},
			() => getTranslation()
		)
	}

	it('looks up a plain message', () => {
		expect(msgWith({})('action.copy')).toBe('Copy')
	})

	it('substitutes values into a placeholder', () => {
		expect(msgWith({})('a11y.shape-index', { num: 2, total: 7 })).toBe('2 of 7')
	})

	it('selects a plural category from the locale, not from the value alone', () => {
		const msg = msgWith({})
		expect(msg('comments.replies', { count: 1 })).toBe('1 reply')
		expect(msg('comments.replies', { count: 4 })).toBe('4 replies')
	})

	// Apps are documented to pass their own keys and plain text through `msg`.
	it('returns an unknown key as-is', () => {
		expect(msgWith({})('my.own.key')).toBe('my.own.key')
		expect(msgWith({ 'my.own.key': 'Mine' })('my.own.key')).toBe('Mine')
	})

	it('renders an empty message as empty, not as its id', () => {
		expect(msgWith({ 'action.copy': '' })('action.copy')).toBe('')
	})

	it('passes a nullish id straight through', () => {
		expect(msgWith({})(undefined)).toBeUndefined()
	})

	// An app's override is not necessarily valid ICU. A stray brace must not take down the UI.
	it('falls back to the raw string when an override is malformed', () => {
		expect(msgWith({ 'my.own.key': 'Cost: {' })('my.own.key', { n: 1 })).toBe('Cost: {')
	})

	it('translates against the declared English when there is no provider at all', () => {
		const msg = inContext(null, () => getTranslation())
		expect(msg('my.own.key')).toBe('my.own.key')
	})
})
