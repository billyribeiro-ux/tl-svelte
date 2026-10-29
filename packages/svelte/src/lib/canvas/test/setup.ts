/**
 * Browser API stand-ins jsdom lacks, for the canvas tests. Import for its side effects:
 * `import './test/setup'`.
 */
class ResizeObserverStub {
	observe() {}
	unobserve() {}
	disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver

// jsdom has no canvas implementation; CanvasOverlays bails out when there is no 2d context.
HTMLCanvasElement.prototype.getContext = (() =>
	null) as unknown as typeof HTMLCanvasElement.prototype.getContext

window.matchMedia ??= ((query: string) => ({
	matches: false,
	media: query,
	onchange: null,
	addListener() {},
	removeListener() {},
	addEventListener() {},
	removeEventListener() {},
	dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia

;(globalThis as any).FontFace ??= class FontFace {
	load() {
		return Promise.resolve()
	}
}

if (!(document as any).fonts) {
	;(document as any).fonts = {
		add() {},
		delete() {},
		forEach() {},
		[Symbol.iterator]: () => [][Symbol.iterator](),
	}
}

if (typeof globalThis.DragEvent === 'undefined') {
	;(globalThis as any).DragEvent = class DragEvent extends Event {
		dataTransfer: unknown
		constructor(type: string, init: any = {}) {
			super(type, init)
			this.dataTransfer = init.dataTransfer ?? { getData: () => '', setData() {}, files: [] }
		}
	}
}

// jsdom has no pointer capture; the canvas handlers call these on every press.
Element.prototype.setPointerCapture ??= function () {}
Element.prototype.releasePointerCapture ??= function () {}
Element.prototype.hasPointerCapture ??= function () {
	return false
}
