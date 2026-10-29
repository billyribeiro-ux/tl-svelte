import type { SvgExportContext } from '@svelte-draw/editor'
import { promiseWithResolve } from '@svelte-draw/utils'
import { getContext, onDestroy, setContext } from 'svelte'

const SVG_EXPORT_KEY = Symbol('svelte-draw.svgExport')

/** Provides the SVG export context to every descendant component. Call during component initialisation. */
export function setSvgExportContext(context: SvgExportContext): void {
	setContext(SVG_EXPORT_KEY, context)
}

/**
 * Returns the current SVG export context, or `null` if the component isn't being rendered for an
 * SVG export. Replaces React's `useSvgExportContext`.
 */
export function getSvgExportContext(): SvgExportContext | null {
	return getContext<SvgExportContext | undefined>(SVG_EXPORT_KEY) ?? null
}

/**
 * Delay an SVG export until the returned function is called (or the component is destroyed). Call
 * during component initialisation. Has no effect outside of an SVG export. Replaces React's
 * `useDelaySvgExport`.
 *
 * @example
 * ```ts
 * const readyForExport = delaySvgExport()
 * // later, once the data has loaded:
 * readyForExport()
 * ```
 */
export function delaySvgExport(): () => void {
	const ctx = getSvgExportContext()
	const promise = promiseWithResolve<void>()
	ctx?.waitUntil(promise)
	onDestroy(() => promise.resolve())
	return () => promise.resolve()
}
