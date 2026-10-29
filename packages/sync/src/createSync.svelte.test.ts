import { TLSyncClient } from '@svelte-draw/sync-core'
import { flushSync } from 'svelte'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSync, type UseSyncOptions } from './createSync.svelte'

vi.mock('@svelte-draw/sync-core', async () => {
	const actual = await vi.importActual<typeof import('@svelte-draw/sync-core')>('@svelte-draw/sync-core')
	// capture each client's callbacks so the test can drive the handshake outcome directly
	class MockTLSyncClient {
		static instances: MockTLSyncClient[] = []
		store: any
		socket: any
		constructor(public opts: any) {
			this.store = opts.store
			this.socket = opts.socket
			MockTLSyncClient.instances.push(this)
		}
		close = vi.fn()
	}
	return { ...actual, TLSyncClient: MockTLSyncClient }
})

const Mock = TLSyncClient as unknown as {
	instances: Array<{ opts: any; store: any; socket: any; close: ReturnType<typeof vi.fn> }>
}

const assets = { upload: vi.fn(), resolve: vi.fn() } as any

function makeSocket() {
	return {
		connectionStatus: 'online' as const,
		sendMessage: vi.fn(),
		onReceiveMessage: vi.fn(() => () => {}),
		onStatusChange: vi.fn(() => () => {}),
		restart: vi.fn(),
		close: vi.fn(),
	}
}

describe('createSync', () => {
	let options = $state.raw<UseSyncOptions>(null as any)
	let sync: ReturnType<typeof createSync>
	let destroy: (() => void) | undefined

	function render(opts: UseSyncOptions) {
		options = opts
		if (!destroy) {
			destroy = $effect.root(() => {
				sync = createSync(() => options)
			})
		}
		flushSync()
	}

	beforeEach(() => {
		Mock.instances.length = 0
		vi.spyOn(console, 'error').mockImplementation(() => {})
	})
	afterEach(() => {
		destroy?.()
		destroy = undefined
		vi.restoreAllMocks()
	})

	it("clears a previous client's error once a new room loads", () => {
		const socketA = makeSocket()
		render({ connect: () => socketA as any, roomId: 'a', assets })
		expect(sync.current.status).toBe('loading')

		// the first room is missing: the store reports the error
		Mock.instances[0].opts.onSyncError('NOT_FOUND')
		flushSync()
		expect(sync.current.status).toBe('error')

		// the caller switches to another room without remounting; a fresh client is created
		const socketB = makeSocket()
		render({ connect: () => socketB as any, roomId: 'b', assets })
		expect(Mock.instances).toHaveLength(2)
		const clientB = Mock.instances[1]

		clientB.opts.onAfterConnect(clientB, { isReadonly: false, objectAccess: 'write' })
		clientB.opts.onLoad(clientB)
		flushSync()

		// the healthy room must not inherit the old room's NOT_FOUND
		expect(sync.current).toMatchObject({
			status: 'synced-remote',
			connectionStatus: 'online',
			objectAccess: 'write',
		})
	})

	it('does not reconnect when only the options object identity changes', () => {
		const connect = () => makeSocket() as any
		render({ connect, roomId: 'a', assets })
		render({ connect, roomId: 'a', assets })
		expect(Mock.instances).toHaveLength(1)
	})

	it('closes the client and socket on destroy', () => {
		const socket = makeSocket()
		render({ connect: () => socket as any, roomId: 'a', assets })
		destroy?.()
		destroy = undefined
		expect(Mock.instances[0].close).toHaveBeenCalled()
		expect(socket.close).toHaveBeenCalled()
	})

	it('rejects uri and connect together', () => {
		expect(() =>
			render({ connect: () => makeSocket() as any, uri: 'ws://x', assets } as any)
		).toThrow('uri and connect cannot be used together')
	})
})
