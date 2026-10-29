/**
 * Browser API stand-ins jsdom lacks, for the Svelte component tests. Import for its side effects:
 * `import './setup'`. (Copied from packages/svelte/src/lib/canvas/test/setup.ts.)
 */
class ResizeObserverStub {
	observe() {}
	unobserve() {}
	disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver

// jsdom has no canvas implementation.
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

Element.prototype.setPointerCapture ??= function () {}
Element.prototype.releasePointerCapture ??= function () {}
Element.prototype.hasPointerCapture ??= function () {
	return false
}

// jsdom has no layout; ProseMirror (TipTap) asks Ranges for their rects when it scrolls the
// selection into view.
const emptyRect = { x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0 }
Range.prototype.getBoundingClientRect ??= () => ({ ...emptyRect, toJSON: () => emptyRect })
Range.prototype.getClientRects ??= () =>
	({
		length: 0,
		item: () => null,
		[Symbol.iterator]: () => [][Symbol.iterator](),
	}) as unknown as DOMRectList
