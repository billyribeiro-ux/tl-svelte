import { getLicenseManager } from '@svelte-draw/svelte'
import { flushSync, mount, unmount } from 'svelte'
import { vi } from 'vitest'
import { createCommentingEnabled } from '../lib/ui/hooks/useCommentingEnabled.svelte'
import HookProbe from './svelte/HookProbe.svelte'
import OutsideEditorUi from './svelte/OutsideEditorUi.svelte'
import { byTestId, renderSvelteDraw } from './testutils/renderSvelteDrawComponent'

// Default UI components can be mounted beside <SvelteDraw /> rather than inside it, wrapped in the
// providers the caller recreates (container, editor, ui context). The license provider is not
// among them — it only exists inside <SvelteDrawEditor />.
describe('default UI mounted outside <SvelteDraw />', () => {
	it('renders the default toolbar and resolves license feature flags through the editor', async () => {
		const rendered = await renderSvelteDraw(
			{ components: { Toolbar: null } },
			{ waitForPatterns: true }
		)
		const { editor } = rendered

		expect(editor.licenseManager).toBeDefined()

		// `Toolbar: null` keeps the editor's own toolbar out, so any toolbar found is the one below.
		expect(byTestId('tools.select')).toBeNull()

		const sink: { read?(): unknown } = {}
		const target = document.createElement('div')
		document.body.appendChild(target)
		const mounted = mount(OutsideEditorUi, {
			target,
			props: { editor, container: editor.getContainer(), sink },
		})
		flushSync()

		await vi.waitFor(() => expect(byTestId('tools.select')).toBeTruthy())
		// In tests the environment counts as development, where every feature is licensed — so a
		// `true` here proves the flag resolved via the editor's license manager, not the
		// fail-closed `false` of having no license manager at all.
		expect(sink.read?.()).toBe(true)

		unmount(mounted)
		target.remove()
		editor.dispose()
		rendered.unmount()
	})

	it('license feature flags fail closed with no editor and no license context', () => {
		const sink: { read?(): unknown } = {}
		const target = document.createElement('div')
		const mounted = mount(HookProbe, { target, props: { use: createCommentingEnabled, sink } })
		flushSync()

		expect(sink.read?.()).toBe(false)

		unmount(mounted)
	})

	it('getLicenseManager throws when there is no license provider and no editor', () => {
		const target = document.createElement('div')
		// Svelte reports the error from the probe's initialisation through mount(); silence the
		// expected console noise.
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
		try {
			expect(() =>
				mount(HookProbe, {
					target,
					props: {
						use: () => {
							getLicenseManager()
							return { current: null }
						},
						sink: {},
					},
				})
			).toThrow(
				'getLicenseManager must be used inside of the <SvelteDraw /> or <SvelteDrawEditor /> components'
			)
		} finally {
			consoleError.mockRestore()
		}
	})
})
