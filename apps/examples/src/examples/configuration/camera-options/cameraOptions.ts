import type { BoxModel, TLCameraOptions } from 'svelte-draw'

export const CAMERA_OPTIONS: TLCameraOptions = {
	isLocked: false,
	wheelBehavior: 'pan',
	panSpeed: 1,
	zoomSpeed: 1,
	zoomSteps: [0.1, 0.25, 0.5, 1, 2, 4, 8],
	constraints: {
		initialZoom: 'fit-max',
		baseZoom: 'fit-max',
		bounds: {
			x: 0,
			y: 0,
			w: 1600,
			h: 900,
		},
		behavior: { x: 'contain', y: 'contain' },
		padding: { x: 100, y: 100 },
		origin: { x: 0.5, y: 0.5 },
	},
}

export const BOUNDS_SIZES: Record<string, BoxModel> = {
	a4: { x: 0, y: 0, w: 1050, h: 1485 },
	landscape: { x: 0, y: 0, w: 1600, h: 900 },
	portrait: { x: 0, y: 0, w: 900, h: 1600 },
	square: { x: 0, y: 0, w: 900, h: 900 },
}
