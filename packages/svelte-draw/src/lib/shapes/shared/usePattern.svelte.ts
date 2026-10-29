import { last } from '@svelte-draw/editor'
import { fromComputed, getEditor } from '@svelte-draw/svelte'
import {
	getDefaultPatterns,
	getPatternImageBlob,
	getPatternLodsToGenerate,
	type PatternDef,
} from './hashPatternUtils'

/**
 * Generates the hash pattern images for every zoom level of detail and exposes them as `<pattern>`
 * definitions. Call during component initialisation. Replaces the React `usePattern` hook.
 */
export function usePattern(): {
	readonly backgroundUrls: PatternDef[]
	readonly isReady: boolean
} {
	const editor = getEditor()
	const dpr = fromComputed('devicePixelRatio', () => editor.getInstanceState().devicePixelRatio)
	// In dynamic size mode, new shapes are created with scale = 1 / zoomLevel.
	// For pattern LOD generation, we use the worst-case effective zoom:
	// a shape created at min zoom and later viewed at max zoom (maxZoom / minZoom)
	const maxEffectiveZoom = fromComputed('maxEffectiveZoom', () => {
		const steps = editor.getCameraOptions().zoomSteps
		return last(steps)! / steps[0]
	})
	let isReady = $state(false)
	let backgroundUrls = $state.raw<PatternDef[]>(getDefaultPatterns(maxEffectiveZoom.current))

	$effect(() => {
		const currentDpr = dpr.current
		const currentMaxEffectiveZoom = maxEffectiveZoom.current

		if (process.env.NODE_ENV === 'test') {
			isReady = true
			return
		}

		const definition = editor.getCurrentTheme()
		const lightSolid = definition.colors.light.solid
		const darkSolid = definition.colors.dark.solid

		const promise = Promise.all(
			getPatternLodsToGenerate(currentMaxEffectiveZoom).flatMap<Promise<PatternDef>>((zoom) => [
				getPatternImageBlob(currentDpr, zoom, lightSolid).then((blob) => ({
					zoom,
					theme: 'light',
					url: URL.createObjectURL(blob),
				})),
				getPatternImageBlob(currentDpr, zoom, darkSolid).then((blob) => ({
					zoom,
					theme: 'dark',
					url: URL.createObjectURL(blob),
				})),
			])
		)

		let isCancelled = false
		promise.then((urls) => {
			if (isCancelled) return
			backgroundUrls = urls
			isReady = true
		})
		return () => {
			isCancelled = true
			isReady = false
			promise.then((patterns) => {
				for (const { url } of patterns) {
					URL.revokeObjectURL(url)
				}
			})
		}
	})

	return {
		get backgroundUrls() {
			return backgroundUrls
		},
		get isReady() {
			return isReady
		},
	}
}
