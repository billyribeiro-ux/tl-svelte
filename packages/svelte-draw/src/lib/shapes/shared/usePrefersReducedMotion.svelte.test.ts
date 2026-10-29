import { flushSync, mount, unmount } from 'svelte'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTestEditor, flush, mountInEditor } from '../../../test/svelte/helpers'
import HookProbe from '../../../test/svelte/HookProbe.svelte'
import { usePrefersReducedMotion } from './usePrefersReducedMotion.svelte'

const cleanups: (() => void)[] = []
afterEach(() => {
	for (const cleanup of cleanups.splice(0)) cleanup()
	vi.restoreAllMocks()
})

describe('usePrefersReducedMotion', () => {
	describe('inside an editor', () => {
		it('follows the editor animation speed: 0 means reduced motion', async () => {
			const test = createTestEditor()
			cleanups.push(() => test.dispose())
			const original = test.editor.user.getUserPreferences().animationSpeed
			cleanups.push(() => test.editor.user.updateUserPreferences({ animationSpeed: original }))
			const sink: { read?(): unknown } = {}
			const m = mountInEditor(test, HookProbe, { use: usePrefersReducedMotion, sink })
			cleanups.push(() => m.unmount())
			await flush()

			test.editor.user.updateUserPreferences({ animationSpeed: 0 })
			await flush()
			expect(sink.read!()).toBe(true)

			test.editor.user.updateUserPreferences({ animationSpeed: 1 })
			await flush()
			expect(sink.read!()).toBe(false)
		})
	})

	describe('outside of an editor', () => {
		function mockMatchMedia(matches: boolean) {
			let listener: (() => void) | undefined
			const mql = {
				matches,
				media: '(prefers-reduced-motion: reduce)',
				addEventListener: (_: string, l: () => void) => (listener = l),
				removeEventListener: vi.fn(),
			}
			vi.spyOn(window, 'matchMedia').mockReturnValue(mql as unknown as MediaQueryList)
			return {
				mql,
				change(next: boolean) {
					mql.matches = next
					listener!()
				},
			}
		}

		function mountProbe() {
			const sink: { read?(): unknown } = {}
			const target = document.createElement('div')
			document.body.appendChild(target)
			const m = mount(HookProbe, { target, props: { use: usePrefersReducedMotion, sink } })
			cleanups.push(() => {
				unmount(m)
				target.remove()
			})
			flushSync()
			return sink
		}

		it('reads and follows the prefers-reduced-motion media query', () => {
			const media = mockMatchMedia(true)
			const sink = mountProbe()
			expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
			expect(sink.read!()).toBe(true)

			media.change(false)
			flushSync()
			expect(sink.read!()).toBe(false)
		})

		it('stops listening when the component is destroyed', () => {
			const media = mockMatchMedia(false)
			const sink = mountProbe()
			expect(sink.read!()).toBe(false)
			cleanups.pop()!()
			expect(media.mql.removeEventListener).toHaveBeenCalledTimes(1)
		})
	})
})
