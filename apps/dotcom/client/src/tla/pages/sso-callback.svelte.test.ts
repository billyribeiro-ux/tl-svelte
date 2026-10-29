import { flushSync, mount, unmount } from 'svelte'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const handleRedirectCallback = vi.fn()
const navigate = vi.fn()
const captureException = vi.fn()

vi.mock('../../utils/clerk.svelte', () => ({
	getClerk: () => ({ instance: { handleRedirectCallback } }),
	getAuth: () => ({ current: { isLoaded: true } }),
}))
vi.mock('@sentry/browser', () => ({ captureException: (e: unknown) => captureException(e) }))
vi.mock('../../utils/router.svelte', () => ({
	navigate: (...args: unknown[]) => navigate(...args),
}))

import SsoCallback from './sso-callback.svelte'

async function render() {
	const component = mount(SsoCallback, { target: document.createElement('div') })
	flushSync()
	// let the rejected/resolved promise settle
	await Promise.resolve()
	await Promise.resolve()
	unmount(component)
}

describe('sso-callback', () => {
	beforeEach(() => vi.clearAllMocks())

	it('reports a failed callback and reopens sign-in instead of leaving a blank page', async () => {
		const err = new Error('callback failed')
		handleRedirectCallback.mockRejectedValue(err)
		await render()
		expect(captureException).toHaveBeenCalledWith(err)
		expect(navigate).toHaveBeenCalledWith('/', { replace: true, state: { openSignIn: true } })
	})

	it('leaves navigation to Clerk when the callback succeeds', async () => {
		handleRedirectCallback.mockResolvedValue(undefined)
		await render()
		expect(navigate).not.toHaveBeenCalled()
		expect(captureException).not.toHaveBeenCalled()
	})
})
