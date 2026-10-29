import {
	debugFlags,
	getGlobalDocument,
	sanitizeId,
	suffixSafeId,
	type SafeId,
} from '@svelte-draw/editor'
import { getSharedSafeId, hasIdScope } from '@svelte-draw/svelte'

export const TILE_PATTERN_SIZE = 8

const generateImage = (dpr: number, currentZoom: number, solid: string) => {
	return new Promise<Blob>((resolve, reject) => {
		const size = TILE_PATTERN_SIZE * currentZoom * dpr

		const canvasEl = getGlobalDocument().createElement('canvas')
		canvasEl.width = size
		canvasEl.height = size

		const ctx = canvasEl.getContext('2d')
		if (!ctx) {
			reject()
			return
		}

		ctx.fillStyle = solid
		ctx.fillRect(0, 0, size, size)

		// This essentially generates an inverse of the pattern we're drawing.
		ctx.globalCompositeOperation = 'destination-out'

		ctx.lineCap = 'round'
		ctx.lineWidth = 1.25 * currentZoom * dpr

		const t = 8 / 12
		const s = (v: number) => v * currentZoom * dpr

		ctx.beginPath()
		ctx.moveTo(s(t * 1), s(t * 3))
		ctx.lineTo(s(t * 3), s(t * 1))

		ctx.moveTo(s(t * 5), s(t * 7))
		ctx.lineTo(s(t * 7), s(t * 5))

		ctx.moveTo(s(t * 9), s(t * 11))
		ctx.lineTo(s(t * 11), s(t * 9))
		ctx.stroke()

		canvasEl.toBlob((blob) => {
			if (!blob || debugFlags.throwToBlob.get()) {
				reject()
			} else {
				resolve(blob)
			}
		})
	})
}

// Generating the pattern images is expensive (canvas draw + encode), but the result only depends
// on the device pixel ratio, zoom level, and solid color. Cache the blobs at the module level so
// the work is done once and reused across editor mounts and instances. Object URLs are still
// created and revoked per-instance; only the underlying blobs are shared.
const patternImageBlobCache = new Map<string, Promise<Blob>>()

export function getPatternImageBlob(dpr: number, zoom: number, solid: string): Promise<Blob> {
	const key = `${dpr}_${zoom}_${solid}`
	let blob = patternImageBlobCache.get(key)
	if (!blob) {
		blob = generateImage(dpr, zoom, solid)
		// Don't keep a rejected promise around (e.g. the throwToBlob debug flag), so a later call
		// can retry once the failure condition is gone.
		blob.catch(() => patternImageBlobCache.delete(key))
		patternImageBlobCache.set(key, blob)
	}
	return blob
}

const canvasBlob = (size: [number, number], fn: (ctx: CanvasRenderingContext2D) => void) => {
	const canvas = getGlobalDocument().createElement('canvas')
	canvas.width = size[0]
	canvas.height = size[1]
	const ctx = canvas.getContext('2d')
	if (!ctx) return ''
	fn(ctx)
	return canvas.toDataURL()
}

export interface PatternDef {
	zoom: number
	url: string
	theme: string
}

let defaultPixels: { white: string; black: string } | null = null
function getDefaultPixels() {
	if (!defaultPixels) {
		defaultPixels = {
			white: canvasBlob([1, 1], (ctx) => {
				ctx.fillStyle = '#f8f9fa'
				ctx.fillRect(0, 0, 1, 1)
			}),
			black: canvasBlob([1, 1], (ctx) => {
				ctx.fillStyle = '#212529'
				ctx.fillRect(0, 0, 1, 1)
			}),
		}
	}
	return defaultPixels
}

function getPatternLodForZoomLevel(zoom: number) {
	return Math.ceil(Math.log2(Math.max(1, zoom)))
}

// An SVG export tree has no id scope of its own (the defs and the shapes are separate component
// trees mounted under the same export), so fall back to one fixed id that can't clash with a live
// editor's scoped ids. Both sides use the same function, so the ids still match.
const EXPORT_HASH_PATTERN_ID = sanitizeId('tl_export_hash_pattern') as SafeId

/**
 * Returns a function that maps a zoom level and color mode to the id of the shared hash pattern.
 * Call during component initialisation (it reads the editor's id scope). Replaces the React
 * `useGetHashPatternZoomName` hook.
 */
export function createGetHashPatternZoomName() {
	const id = hasIdScope() ? getSharedSafeId('hash_pattern') : EXPORT_HASH_PATTERN_ID
	return (zoom: number, theme: string) => {
		const lod = getPatternLodForZoomLevel(zoom)
		return suffixSafeId(id, `${theme}_${lod}`)
	}
}

export function getPatternLodsToGenerate(maxZoom: number) {
	const levels = []
	const minLod = 0
	const maxLod = getPatternLodForZoomLevel(maxZoom)
	for (let i = minLod; i <= maxLod; i++) {
		levels.push(Math.pow(2, i))
	}
	return levels
}

export function getDefaultPatterns(maxZoom: number): PatternDef[] {
	const defaultPixels = getDefaultPixels()
	return getPatternLodsToGenerate(maxZoom).flatMap((zoom) => [
		{ zoom, url: defaultPixels.white, theme: 'light' },
		{ zoom, url: defaultPixels.black, theme: 'dark' },
	])
}
