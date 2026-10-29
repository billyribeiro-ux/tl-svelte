import { getContext, setContext } from 'svelte'
import type { TLEditorComponents } from '../context/components'
import DefaultBackground from './DefaultBackground.svelte'
import DefaultCanvas from './DefaultCanvas.svelte'
import DefaultCursor from './DefaultCursor.svelte'
import DefaultGrid from './DefaultGrid.svelte'
import DefaultLoadingScreen from './DefaultLoadingScreen.svelte'
import DefaultShapeErrorFallback from './DefaultShapeErrorFallback.svelte'
import DefaultShapeWrapper from './DefaultShapeWrapper.svelte'
import DefaultSpinner from './DefaultSpinner.svelte'
import DefaultSvgDefs from './DefaultSvgDefs.svelte'
import type { ResolvedEditorComponents } from './types'

const COMPONENTS_KEY = Symbol('svelte-draw.components')

/**
 * The defaults for every slot this layer owns. `ErrorFallback` (`DefaultErrorFallback`) is owned by
 * the root layer, which passes it through `setEditorComponents(..., { ErrorFallback })`.
 */
export const defaultEditorComponents = {
	Background: DefaultBackground,
	Canvas: DefaultCanvas,
	CollaboratorCursor: DefaultCursor,
	Grid: DefaultGrid,
	InFrontOfTheCanvas: null,
	LoadingScreen: DefaultLoadingScreen,
	OnTheCanvas: null,
	ShapeWrapper: DefaultShapeWrapper,
	Spinner: DefaultSpinner,
	SvgDefs: DefaultSvgDefs,
	ShapeErrorFallback: DefaultShapeErrorFallback,
} as unknown as Omit<ResolvedEditorComponents, 'ErrorFallback'>

type OverridesSource = TLEditorComponents | undefined | (() => TLEditorComponents | undefined)

const KEYS = [
	'Background',
	'Canvas',
	'CollaboratorCursor',
	'Grid',
	'InFrontOfTheCanvas',
	'LoadingScreen',
	'OnTheCanvas',
	'ShapeWrapper',
	'Spinner',
	'SvgDefs',
	'ErrorFallback',
	'ShapeErrorFallback',
] as const

function shallowEqual(a: Record<string, unknown>, b: Record<string, unknown>) {
	const ak = Object.keys(a)
	if (ak.length !== Object.keys(b).length) return false
	for (const k of ak) if (a[k] !== b[k]) return false
	return true
}

/**
 * Replacement for `EditorComponentsProvider`. Call during initialisation of the editor's root
 * component. Pass a getter to keep the overrides reactive to prop changes: the resolved object
 * returned by {@link getEditorComponents} reads through it on every access, and is shallow-stable
 * (like `useShallowObjectIdentity` was) so the values keep their identity until an override changes.
 *
 * `extraDefaults` supplies defaults owned by other layers (`ErrorFallback`).
 */
export function setEditorComponents(
	overrides?: OverridesSource,
	extraDefaults: Pick<TLEditorComponents, 'ErrorFallback'> = {}
): ResolvedEditorComponents {
	const read = () => (typeof overrides === 'function' ? overrides() : overrides) ?? {}
	let lastOverrides: Record<string, unknown> | null = null
	let lastValue: Record<string, unknown> = {}

	function resolve() {
		const current = read() as Record<string, unknown>
		if (lastOverrides && shallowEqual(lastOverrides, current)) return lastValue
		lastOverrides = { ...current }
		lastValue = { ...defaultEditorComponents, ...extraDefaults, ...current }
		return lastValue
	}

	// Expose live getters so reads inside templates/deriveds track the overrides source.
	const resolved = {} as Record<string, unknown>
	for (const key of KEYS) {
		Object.defineProperty(resolved, key, { enumerable: true, get: () => resolve()[key] })
	}
	setContext(COMPONENTS_KEY, resolved)
	return resolved as unknown as ResolvedEditorComponents
}

/** Replacement for `useEditorComponents`. Throws outside of a `setEditorComponents` tree. */
export function getEditorComponents(): ResolvedEditorComponents {
	const components = getContext<ResolvedEditorComponents | undefined>(COMPONENTS_KEY)
	if (!components) {
		throw new Error(
			'getEditorComponents must be used inside of an editor tree (setEditorComponents)'
		)
	}
	return components
}
