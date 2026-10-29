import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import { defineMessages, getDeclaredMessages } from '@svelte-draw/editor'
import { flushSync, mount, unmount } from 'svelte'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ProviderHarness from '../hooks/useTranslation/test/ProviderHarness.svelte'
import { getTranslation } from '../hooks/useTranslation/useTranslation.svelte'
import { getSvelteDrawI18n, type TLUiMessageProps } from './i18n'
import FHarness from './test/FHarness.svelte'

const messages = defineMessages({
	copy: { id: 'action.copy', defaultMessage: 'Copy' },
	replies: {
		id: 'comments.replies',
		defaultMessage: '{count, plural, one {# reply} other {# replies}}',
	},
})

let app: ReturnType<typeof mount> | undefined
afterEach(() => {
	if (app) unmount(app)
	app = undefined
	document.body.innerHTML = ''
})

type Overrides = Record<string, Record<string, string>>

/** Mounts the provider stack and returns whatever `read` produced inside it. */
function inProvider<T>(
	read: () => T,
	opts: { overrides?: Overrides; locale?: string; outerLocale?: string } = {}
): T {
	let result!: T
	app = mount(ProviderHarness, {
		target: document.body,
		props: {
			locale: opts.locale ?? 'en',
			overrides: opts.overrides,
			outerLocale: opts.outerLocale,
			run: () => {
				result = read()
			},
		},
	})
	return result
}

function renderF(
	fProps: TLUiMessageProps,
	opts: { overrides?: Overrides; variant?: 'plain' | 'tag' | 'element' } = {}
) {
	app = mount(FHarness, {
		target: document.body,
		props: { fProps, overrides: opts.overrides, variant: opts.variant },
	})
	flushSync()
	return document.body
}

// `defineMessages` is where the English lives; the id it carries is what the UI translates. The
// key-based lookups themselves are covered in useTranslation.svelte.test.ts.
describe('a declared message through msg()', () => {
	it('resolves its id against the catalog', () => {
		const msg = inProvider(() => getTranslation())
		expect(msg(messages.copy.id)).toBe('Copy')
	})

	// One catalogue behind the overrides and the declared messages, so an app overrides a key once
	// and a message declared against that key picks it up.
	it('picks up overrides.translations', () => {
		const msg = inProvider(() => getTranslation(), {
			overrides: { en: { 'action.copy': 'Duplicate it' } },
		})
		expect(msg(messages.copy.id)).toBe('Duplicate it')
	})
})

describe('F', () => {
	it('renders the catalog message, not the default message', () => {
		const body = renderF({ ...messages.copy }, { overrides: { en: { 'action.copy': 'Kopieer' } } })
		expect(body.textContent).toContain('Kopieer')
		expect(body.textContent).not.toContain('Copy')
	})

	it('renders its English when given no id', () => {
		const body = renderF({ defaultMessage: 'Hello there' })
		expect(body.textContent).toContain('Hello there')
	})
})

describe('SvelteDrawUiTranslationProvider', () => {
	// An override is local data, so a changed override applies without another fetch (the old
	// version merged it in the same effect as the fetch).
	it('applies a changed override without refetching', () => {
		const first = inProvider(() => getTranslation(), {
			overrides: { en: { 'app.title': 'First' } },
		})
		expect(first('app.title')).toBe('First')
		unmount(app!)
		const second = inProvider(() => getTranslation(), {
			overrides: { en: { 'app.title': 'Second' } },
		})
		expect(second('app.title')).toBe('Second')
	})

	// A locale the SDK ships nothing for falls back to English, and its overrides still have to
	// apply — that's the only place an app-only locale's strings can come from.
	it('applies overrides for a locale the SDK has no catalogue for', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		try {
			const msg = inProvider(() => getTranslation(), {
				locale: 'zz',
				overrides: { zz: { 'app.title': 'App only' } },
			})
			expect(msg('app.title')).toBe('App only')
		} finally {
			warn.mockRestore()
		}
	})

	// Only the active locale's overrides used to apply, so an app key missing from them showed its id.
	it("falls back to an app key's English override in another locale", () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		try {
			const msg = inProvider(() => getTranslation(), {
				locale: 'zz',
				overrides: { en: { 'app.title': 'English', 'action.copy': 'Make a copy' }, zz: {} },
			})
			expect(msg('app.title')).toBe('English')
			// No SDK catalog for this locale either, so the app's English wording beats the SDK's.
			expect(msg('action.copy')).toBe('Make a copy')
		} finally {
			warn.mockRestore()
		}
	})

	it('keeps a catalog string over an English override of the same key', async () => {
		const fetchSpy = vi
			.spyOn(window, 'fetch')
			.mockImplementation(
				async () => ({ ok: true, json: async () => ({ 'action.copy': 'Copier' }) }) as Response
			)
		try {
			const msg = inProvider(() => getTranslation(), {
				locale: 'fr',
				overrides: { en: { 'action.copy': 'Make a copy' } },
			})
			await vi.waitFor(() => expect(msg('action.copy')).toBe('Copier'))
		} finally {
			fetchSpy.mockRestore()
		}
	})

	// `<SvelteDraw>` nests the UI's provider inside one fixed at the browser's language. Taking the
	// outer one's catalog left a French browser French after switching to English.
	it("doesn't take another provider's language when nested inside it", async () => {
		const fetchSpy = vi
			.spyOn(window, 'fetch')
			.mockImplementation(
				async () => ({ ok: true, json: async () => ({ 'action.copy': 'Copier' }) }) as Response
			)
		try {
			const msg = inProvider(() => getTranslation(), { locale: 'en', outerLocale: 'fr' })
			await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalled())
			await new Promise((resolve) => setTimeout(resolve, 0))
			expect(msg('action.copy')).toBe('Copy')
		} finally {
			fetchSpy.mockRestore()
		}
	})

	// An empty override is how an app hides a label; a lookup that treats '' as missing shows the id.
	it('renders an empty override as empty', () => {
		const msg = inProvider(() => getTranslation(), { overrides: { en: { 'action.copy': '' } } })
		expect(msg('action.copy')).toBe('')
	})
})

describe('rich text in a message', () => {
	// An app marking up part of a string — "<name>Ada</name> mentioned you" — needs the markup
	// inside the message so a translator can move it, rather than split into fragments.
	it('renders a tag through the snippet given for it', () => {
		const body = renderF(
			{
				defaultMessage: '<name>{author}</name> mentioned you',
				id: 'example.mention',
				values: { author: 'Ada' },
			},
			{ variant: 'tag' }
		)
		const who = body.querySelector('[data-testid="who"]')!
		expect(who.textContent).toBe('Ada')
		expect(who.tagName).toBe('STRONG')
		expect(body.textContent).toContain('Ada mentioned you')
	})
})

describe('defineMessages', () => {
	it('keeps a written id, and its literal type', () => {
		const defined = defineMessages({ copy: { id: 'action.copy', defaultMessage: 'Copy' } })
		expect(defined.copy).toEqual({ id: 'action.copy', defaultMessage: 'Copy' })
		// The literal type is what lets a declared id go where a TLUiTranslationKey is expected.
		const key: 'action.copy' = defined.copy.id
		expect(key).toBe('action.copy')
	})

	// Where a bundler plugin was going to supply the id and none ran — every test in an app that
	// writes its messages that way. Throwing here would mean such an app couldn't be tested.
	it('stands the English in for a missing id', () => {
		const defined = defineMessages({ copy: { defaultMessage: 'Copy' } })
		expect(defined.copy).toEqual({ id: 'Copy', defaultMessage: 'Copy' })
	})

	it('renders as its English when no plugin supplied an id', () => {
		const defined = defineMessages({ greet: { defaultMessage: 'Hello there' } })
		const body = renderF({ ...defined.greet })
		expect(body.textContent).toContain('Hello there')
	})
})

describe('the message marker', () => {
	// A tool outside the SDK has to be able to tell text that came through `F` from text that never
	// did. svelte-draw.invalid's language-debug overlay finds untranslated strings by exactly this class.
	it('wraps a message in a span tools can find', () => {
		const container = renderF({ ...messages.copy })
		const marker = container.querySelector('.i18n-msg')
		expect(marker?.textContent).toBe('Copy')
	})
})

describe('an element as a value', () => {
	// A placeholder filled with an element, rather than a tag wrapped around part of the message.
	// Both keep the sentence whole for the translator.
	it('substitutes the snippet into the message', () => {
		const body = renderF(
			{ defaultMessage: 'Still having trouble? {help}', id: 'example.trouble' },
			{ variant: 'element' }
		)
		const help = body.querySelector('[data-testid="help"]')!
		expect(help.tagName).toBe('A')
		expect(help.textContent).toBe('Get help')
		expect(body.textContent).toContain('Still having trouble? Get help')
	})
})

describe('the i18n adapter the editor gets', () => {
	function adapterWith(overrides: Overrides, locale = 'en') {
		return inProvider(() => getSvelteDrawI18n(), {
			overrides: { [locale]: overrides.en ?? {} },
			locale,
		})()
	}

	// Given only the id, the fallback substituted the English whole and put a plural message's own
	// ICU source into an upload toast.
	it('formats the English for an id the catalog has no entry for', () => {
		const i18n = adapterWith({ en: {} })
		expect(
			i18n.translate(
				{
					id: 'app.added-files',
					defaultMessage: '{total, plural, one {Added # file.} other {Added # files.}}',
				},
				{ total: 3 }
			)
		).toBe('Added 3 files.')
	})

	// The requested locale, not the catalog that loaded: for a locale the SDK ships none for, the
	// loaded one is English, and an app formatting dates by `locale` then got English dates.
	it('reports the requested locale, not the catalog that loaded', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		try {
			const adapter = inProvider(() => getSvelteDrawI18n(), { locale: 'zz' })
			expect(adapter().locale).toBe('zz')
		} finally {
			warn.mockRestore()
		}
	})

	it('still prefers a translation when there is one', () => {
		const i18n = adapterWith({ en: { 'app.added-files': 'Added {total}' } })
		expect(i18n.translate({ id: 'app.added-files', defaultMessage: 'x' }, { total: 2 })).toBe(
			'Added 2'
		)
	})
})

describe('the declared English', () => {
	// A chunk imported after mount — a lazily loaded @svelte-draw/commenting — declares labels that are
	// looked up by id. A snapshot taken at mount left them rendering as their ids.
	it('picks up a message declared after mount', () => {
		const msg = inProvider(() => getTranslation())
		expect(msg('test.declared-late')).toBe('test.declared-late')
		defineMessages({ late: { id: 'test.declared-late', defaultMessage: 'Declared late' } })
		flushSync()
		expect(msg('test.declared-late')).toBe('Declared late')
	})

	// Stands in for the English catalog the SDK no longer bundles. Fails when a declaring module is
	// never imported, as `consumerMessages` wasn't. Exempt: messages inline on an `<F>`, which carry
	// their own English, and @svelte-draw/commenting's, which `svelte-draw` doesn't import.
	it('covers main.json once the package has loaded', async () => {
		await import('../../../index')
		// The one test that reads the catalog file, since matching it is the point.
		const repoRoot = path.resolve(__dirname, '../../../../../..')
		const main = JSON.parse(
			readFileSync(path.join(repoRoot, 'assets/translations/main.json'), 'utf8')
		)
		const src = path.resolve(__dirname, '../../..')
		const inlineIds = new Set<string>()
		for (const file of readdirSync(src, { recursive: true })) {
			if (!String(file).endsWith('.tsx') && !String(file).endsWith('.svelte')) continue
			const source = readFileSync(path.join(src, String(file)), 'utf8')
			for (const [, id] of source.matchAll(/<F\b[^>]*?\bid="([^"]+)"/g)) inlineIds.add(id)
		}
		const declared = getDeclaredMessages()
		const missing = Object.keys(main).filter(
			(id) =>
				!(id in declared) &&
				!inlineIds.has(id) &&
				!id.startsWith('comments.') &&
				id !== 'tool.comment'
		)
		expect(missing).toEqual([])
	})
})
