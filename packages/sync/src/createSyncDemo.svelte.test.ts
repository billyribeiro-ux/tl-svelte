import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock modules before imports
vi.mock('./createSync.svelte')
// The `svelte-draw` package is itself mid-port; only its default util lists are needed here, so
// stand-ins keep this test independent of the whole SDK graph.
vi.mock('svelte-draw', () => ({
	defaultShapeUtils: [{ type: 'default-shape' }],
	defaultBindingUtils: [{ type: 'default-binding' }],
}))
vi.mock('@svelte-draw/editor', async () => {
	const actual = await vi.importActual('@svelte-draw/editor')
	return {
		...actual,
		uniqueId: vi.fn(() => 'mock-unique-id'),
		getHashForString: vi.fn((str) => `hash-${str}`),
	}
})

import { getHashForString, uniqueId, type TLAsset } from '@svelte-draw/editor'
import { defaultBindingUtils, defaultShapeUtils } from 'svelte-draw'
import { createSync } from './createSync.svelte'
import { createSyncDemo } from './createSyncDemo.svelte'

// Mock fetch globally
const mockFetch = vi.fn() as any
global.fetch = mockFetch

// Mock console.error and alert to avoid noise in tests
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

describe('createSyncDemo', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		consoleSpy.mockClear()
		alertSpy.mockClear()
		vi.mocked(createSync).mockReturnValue({ current: { status: 'loading' } } as any)
		vi.mocked(uniqueId).mockReturnValue('mock-unique-id')
		vi.mocked(getHashForString).mockImplementation((str) => `hash-${str}`)
	})

	describe('core functionality', () => {
		it('should construct correct URI with room ID encoding', () => {
			const roomIdWithSpecialChars = 'room with spaces & symbols!'
			createSyncDemo(() => ({ roomId: roomIdWithSpecialChars }))

			const useSyncCall = vi.mocked(createSync).mock.calls[0][0]()
			expect(useSyncCall.uri).toContain(encodeURIComponent(roomIdWithSpecialChars))
			expect(useSyncCall.roomId).toBe(roomIdWithSpecialChars)
		})

		it('should use custom host when provided', () => {
			const customHost = 'https://custom.server.com'
			createSyncDemo(() => ({ roomId: 'test-room', host: customHost }))

			const useSyncCall = vi.mocked(createSync).mock.calls[0][0]()
			expect(useSyncCall.uri).toBe(`${customHost}/connect/test-room`)
		})

		it('should merge custom shape utils with defaults', () => {
			const customShapeUtils = [{ type: 'custom-shape' } as any]
			createSyncDemo(() => ({ roomId: 'test-room', shapeUtils: customShapeUtils }) as any)

			const useSyncCall = vi.mocked(createSync).mock.calls[0][0]()
			expect((useSyncCall as any).shapeUtils).toEqual([...defaultShapeUtils, ...customShapeUtils])
		})

		it('should merge custom binding utils with defaults', () => {
			const customBindingUtils = [{ type: 'custom-binding' } as any]
			createSyncDemo(() => ({ roomId: 'test-room', bindingUtils: customBindingUtils }) as any)

			const useSyncCall = vi.mocked(createSync).mock.calls[0][0]()
			expect((useSyncCall as any).bindingUtils).toEqual([
				...defaultBindingUtils,
				...customBindingUtils,
			])
		})
	})

	describe('asset upload restrictions', () => {
		it('should block uploads for svelte-draw domains', async () => {
			createSyncDemo(() => ({ roomId: 'test-room', host: 'https://demo.svelte-draw.invalid' }))

			const useSyncCall = vi.mocked(createSync).mock.calls[0][0]()
			const assetStore = useSyncCall.assets
			const file = new File(['test content'], 'test-file.jpg')

			await expect(assetStore.upload({} as TLAsset, file)).rejects.toThrow(
				'Uploading images is disabled in this demo.'
			)
			expect(alertSpy).toHaveBeenCalledWith('Uploading images is disabled in this demo.')
		})

		it('should allow uploads for non-svelte-draw domains', async () => {
			createSyncDemo(() => ({ roomId: 'test-room', host: 'https://demo.server.com' }))

			const useSyncCall = vi.mocked(createSync).mock.calls[0][0]()
			const assetStore = useSyncCall.assets
			const file = new File(['test content'], 'test-file.jpg')

			vi.mocked(mockFetch).mockResolvedValueOnce(new Response())
			vi.mocked(uniqueId).mockReturnValueOnce('unique-123')

			const result = await assetStore.upload({} as TLAsset, file)

			expect(mockFetch).toHaveBeenCalledWith(
				'https://demo.server.com/uploads/unique-123-test-file-jpg',
				expect.objectContaining({ method: 'POST', body: file })
			)
			expect(result).toEqual({ src: 'https://demo.server.com/uploads/unique-123-test-file-jpg' })
		})

		it('should reject the upload when the server responds with an error status', async () => {
			createSyncDemo(() => ({ roomId: 'test-room', host: 'https://demo.server.com' }))

			const useSyncCall = vi.mocked(createSync).mock.calls[0][0]()
			const assetStore = useSyncCall.assets
			const file = new File(['test content'], 'test-file.jpg')

			// a rejected upload resolves the fetch; the asset must not point at a URL that was never stored
			vi.mocked(mockFetch).mockResolvedValueOnce(new Response(null, { status: 409 }))

			await expect(assetStore.upload({} as TLAsset, file)).rejects.toThrow('409')
		})
	})

	describe('asset resolution', () => {
		function resolveImage(props: Record<string, unknown>, scale: number) {
			const assetStore = vi.mocked(createSync).mock.calls[0][0]().assets
			const asset = {
				type: 'image',
				props: { src: 'https://demo.svelte-draw.invalid/uploads/image', ...props },
			}
			return assetStore.resolve!(asset as TLAsset, {
				screenScale: scale,
				steppedScreenScale: scale,
				dpr: 1,
				networkEffectiveType: '4g',
				shouldResolveToOriginal: false,
			})
		}

		it.each([
			{ mimeType: 'image/png', w: 2000, h: 1500, fileSize: 1000, scale: 0.5, expected: '?w=1000' },
			{ mimeType: 'image/jpeg', w: 2000, h: 1500, fileSize: 1000, scale: 0.5, expected: '?w=1000' },
			{ mimeType: 'image/webp', w: 2000, h: 1500, fileSize: 1000, scale: 0.5, expected: '?w=1000' },
			{ mimeType: 'image/jpeg', w: 399, h: 400, fileSize: 1000, scale: 0.5, expected: '' },
			{ mimeType: 'image/jpeg', w: 2000, h: 1500, fileSize: 1000, scale: 0.75, expected: '' },
		])(
			'should resize $mimeType at $w × $h and $scale scale',
			async ({ expected, scale, ...props }) => {
				createSyncDemo(() => ({ roomId: 'test-room', host: 'https://demo.server.com' }))
				expect(await resolveImage(props, scale)).toBe(
					`https://images.svelte-draw.invalid/demo.svelte-draw.invalid/uploads/image${expected}`
				)
			}
		)
	})

	describe('bookmark asset creation', () => {
		it('should create bookmark assets with metadata when successful', async () => {
			const mockEditor = { registerExternalAssetHandler: vi.fn() } as any
			createSyncDemo(() => ({ roomId: 'test-room', host: 'https://demo.server.com' }))

			const useSyncCall = vi.mocked(createSync).mock.calls[0][0]()
			useSyncCall.onMount!(mockEditor)

			const handlerFunction = mockEditor.registerExternalAssetHandler.mock.calls[0][1]
			const testUrl = 'https://example.com'
			const mockMeta = { title: 'Example', description: 'Test' }

			vi.mocked(mockFetch).mockResolvedValueOnce({
				json: () => Promise.resolve(mockMeta),
			} as Response)
			vi.mocked(getHashForString).mockReturnValueOnce('url-hash-123')

			const result = await handlerFunction({ url: testUrl })

			expect(result.type).toBe('bookmark')
			expect(result.props.src).toBe(testUrl)
			expect(result.props.title).toBe('Example')
		})

		it('should handle bookmark creation errors gracefully', async () => {
			const mockEditor = { registerExternalAssetHandler: vi.fn() } as any
			createSyncDemo(() => ({ roomId: 'test-room' }))

			const useSyncCall = vi.mocked(createSync).mock.calls[0][0]()
			useSyncCall.onMount!(mockEditor)

			const handlerFunction = mockEditor.registerExternalAssetHandler.mock.calls[0][1]
			const testUrl = 'https://example.com'

			vi.mocked(mockFetch).mockRejectedValueOnce(new Error('Network error'))
			vi.mocked(getHashForString).mockReturnValueOnce('url-hash-123')

			const result = await handlerFunction({ url: testUrl })

			expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error))
			expect(result.props.title).toBe('')
			expect(result.props.description).toBe('')
		})
	})

	describe('file name sanitization', () => {
		it('should sanitize file names in upload URLs', async () => {
			createSyncDemo(() => ({ roomId: 'test-room', host: 'https://demo.server.com' }))

			const useSyncCall = vi.mocked(createSync).mock.calls[0][0]()
			const assetStore = useSyncCall.assets
			const file = new File(['test'], 'file with spaces & symbols!.jpg')

			vi.mocked(mockFetch).mockResolvedValueOnce(new Response())
			vi.mocked(uniqueId).mockReturnValueOnce('unique-123')

			await assetStore.upload({} as TLAsset, file)

			expect(mockFetch).toHaveBeenCalledWith(
				'https://demo.server.com/uploads/unique-123-file-with-spaces---symbols--jpg',
				expect.any(Object)
			)
		})
	})
})
