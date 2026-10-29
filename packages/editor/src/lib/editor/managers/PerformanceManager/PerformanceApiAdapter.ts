import type { PerformanceManager } from './PerformanceManager'

/** Wrap performance.mark with try/catch — `detail` option may throw in Safari/Firefox. */
function safeMark(name: string, detail?: Record<string, unknown>) {
	try {
		performance.mark(name, detail ? { detail } : undefined)
	} catch {
		performance.mark(name)
	}
}

/**
 * Optional adapter that pipes PerformanceManager events into browser
 * `performance.mark()` / `performance.measure()` for DevTools integration.
 *
 * Tree-shakeable — only included if imported.
 *
 * @example
 * ```ts
 * const adapter = new PerformanceApiAdapter(editor.performance)
 * // ... later
 * adapter.dispose()
 * ```
 *
 * @public
 */
export class PerformanceApiAdapter {
	private cleanups: (() => void)[] = []

	constructor(perfManager: PerformanceManager) {
		this.cleanups.push(
			perfManager.on('interaction-start', (event) => {
				safeMark(`svelte-draw:interaction:${event.name}:start`, { path: event.path })
			})
		)

		this.cleanups.push(
			perfManager.on('interaction-end', (event) => {
				const startMark = `svelte-draw:interaction:${event.name}:start`
				const endMark = `svelte-draw:interaction:${event.name}:end`
				safeMark(endMark, {
					path: event.path,
					fps: event.fps,
					frameCount: event.frameCount,
					shapeCount: event.shapeCount,
				})
				try {
					performance.measure(`svelte-draw:interaction:${event.name}`, startMark, endMark)
				} catch {
					// start mark may not exist if adapter attached mid-interaction
				}
			})
		)

		this.cleanups.push(
			perfManager.on('camera-start', (event) => {
				safeMark(`svelte-draw:camera:${event.type}:start`)
			})
		)

		this.cleanups.push(
			perfManager.on('camera-end', (event) => {
				const startMark = `svelte-draw:camera:${event.type}:start`
				const endMark = `svelte-draw:camera:${event.type}:end`
				safeMark(endMark, { fps: event.fps, shapeCount: event.shapeCount })
				try {
					performance.measure(`svelte-draw:camera:${event.type}`, startMark, endMark)
				} catch {
					// start mark may not exist
				}
			})
		)
	}

	/** Remove all listeners and stop piping events. @public */
	dispose() {
		for (const cleanup of this.cleanups) {
			cleanup()
		}
		this.cleanups.length = 0
	}
}
