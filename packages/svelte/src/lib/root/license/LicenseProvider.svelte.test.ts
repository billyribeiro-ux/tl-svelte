import type { LicenseFromKeyResult } from '@svelte-draw/editor'
import { LicenseManager } from '@svelte-draw/editor'
import { flushSync, mount, unmount } from 'svelte'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LICENSE_TIMEOUT } from './licenseContext'
import LicenseProviderHarness from './LicenseProviderHarness.svelte'

const NO_KEY: LicenseFromKeyResult = { isLicenseParseable: false, reason: 'no-key-provided' }

describe('LicenseProvider', () => {
	const managers: LicenseManager[] = []
	let target: HTMLElement
	let component: ReturnType<typeof mount> | undefined

	function render(initialKey: string | undefined) {
		const props = $state<{ licenseKey: string | undefined }>({ licenseKey: initialKey })
		component = mount(LicenseProviderHarness, {
			target,
			props: {
				get licenseKey() {
					return props.licenseKey
				},
				onManager: (manager: LicenseManager) => {
					managers.push(manager)
				},
			},
		})
		flushSync()
		return {
			rerender(licenseKey: string | undefined) {
				props.licenseKey = licenseKey
				flushSync()
			},
			queryByTestId: (id: string) => target.querySelector(`[data-testid="${id}"]`),
		}
	}

	beforeEach(() => {
		managers.length = 0
		target = document.createElement('div')
		document.body.appendChild(target)
	})
	afterEach(() => {
		if (component) unmount(component)
		component = undefined
		target.remove()
		vi.restoreAllMocks()
		vi.useRealTimers()
	})

	it('creates a new license manager when the license key changes', () => {
		const rendered = render(undefined)
		const initial = managers.at(-1)!

		rendered.rerender('not-a-real-key')
		const changed = managers.at(-1)!
		expect(changed).not.toBe(initial)

		// same key again: the manager is stable
		rendered.rerender('not-a-real-key')
		expect(managers.at(-1)).toBe(changed)
	})

	it('shows the editor again when a new key arrives after the gate closed', () => {
		// validation never settles so the test drives the state by hand
		vi.spyOn(LicenseManager.prototype, 'getLicenseFromKey').mockReturnValue(new Promise(() => {}))
		vi.useFakeTimers()

		const rendered = render('expired-key')
		const expired = managers.at(-1)!
		expired.state.set('expired')
		flushSync()
		vi.advanceTimersByTime(LICENSE_TIMEOUT)
		flushSync()
		expect(rendered.queryByTestId('tl-license-expired')).not.toBeNull()

		rendered.rerender('fresh-key')
		expect(rendered.queryByTestId('tl-license-expired')).toBeNull()
		expect(managers.at(-1)).not.toBe(expired)
	})

	it('ignores the validation result of a manager replaced by a new key', async () => {
		const resolvers: ((result: LicenseFromKeyResult) => void)[] = []
		vi.spyOn(LicenseManager.prototype, 'getLicenseFromKey').mockImplementation(
			() => new Promise((resolve) => resolvers.push(resolve))
		)
		const track = vi.spyOn(LicenseManager.prototype as any, 'maybeTrack')

		const rendered = render(undefined)
		const orphan = managers.at(-1)!
		rendered.rerender('real-key')
		expect(managers.at(-1)).not.toBe(orphan)

		resolvers[0](NO_KEY)
		await new Promise((resolve) => setTimeout(resolve, 0))
		flushSync()
		expect(orphan.state.get()).toBe('pending')
		expect(track).not.toHaveBeenCalled()

		resolvers[1](NO_KEY)
		await new Promise((resolve) => setTimeout(resolve, 0))
		flushSync()
		expect(managers.at(-1)!.state.get()).toBe('unlicensed')
	})
})
