import { type TLEventInfo, deleteFromLocalStorage, setInLocalStorage } from '@svelte-draw/editor'
import { vi } from 'vitest'
import { act, renderSvelteDraw, useDesktopViewport } from './testutils/renderSvelteDrawComponent'

// jsdom has no 2D canvas context; without one the minimap manager throws on mount and the
// minimap reports a crash instead of rendering normally.
const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext')

beforeEach(() => {
	setInLocalStorage('minimap', 'false') // start with the navigation panel expanded
	getContext.mockImplementation(() => new Proxy({}, { get: () => () => {} }) as any)
})

afterEach(() => {
	deleteFromLocalStorage('minimap')
	getContext.mockReset()
})

describe('wheel over the minimap', () => {
	// Issue #10441: the minimap dispatched the wheel to the editor itself, and the navigation
	// panel's wheel pass-through redispatched the same native event to the canvas, so the camera
	// moved at double rate.
	it('dispatches exactly one wheel event to the editor', async () => {
		const { editor, unmount } = await renderSvelteDraw()
		await useDesktopViewport(editor)
		const minimap = document.querySelector('[data-testid="minimap.canvas"]') as HTMLElement
		expect(minimap).toBeTruthy()

		const wheels: TLEventInfo[] = []
		editor.on('event', (info) => {
			if (info.type === 'wheel') wheels.push(info)
		})

		await act(async () => {
			editor.updateInstanceState({ isFocused: true })
			minimap.dispatchEvent(
				new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaX: 0, deltaY: 40 })
			)
			editor.emit('tick', 16)
		})

		expect(wheels).toHaveLength(1)
		editor.dispose()
		unmount()
	})
})
