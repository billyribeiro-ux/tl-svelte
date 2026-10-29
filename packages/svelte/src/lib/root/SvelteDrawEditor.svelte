<script lang="ts">
	import {
		createTLCurrentUser,
		resolveThemes,
		registerColorsFromThemes,
		registerFontsFromThemes,
	} from '@svelte-draw/editor'
	import { annotateError } from '@svelte-draw/utils'
	import OptionalErrorBoundary from '../canvas/OptionalErrorBoundary.svelte'
	import { setEditorPortalHost } from '../canvas/editorPortal'
	import { TL_CONTAINER_CLASS } from './constants'
	import DefaultErrorFallback from './DefaultErrorFallback.svelte'
	import EditorHost from './EditorHost.svelte'
	import { version } from './editorInternals'
	import { deepObjectIdentity, shallowObjectIdentity } from './identity.svelte'
	import LicenseProvider from './license/LicenseProvider.svelte'
	import type { SvelteDrawEditorAllProps, SvelteDrawEditorProps } from './types'

	/**
	 * The editor component without any of the default shapes, tools, or UI. It renders the canvas, or
	 * your own children in its place, with the shape utils, binding utils, tools, and components you
	 * pass in; the `SvelteDraw` component in the `svelte-draw` package wraps it with those defaults.
	 *
	 * @public
	 */
	const allProps: SvelteDrawEditorProps = $props()
	// Which store variant was passed isn't known here, so read every prop through the flat shape.
	const editorProps = $derived(allProps as SvelteDrawEditorAllProps)

	// Register custom colors and fonts before effects run. For external stores,
	// users should also pass themes to createTLStore so they are
	// registered before data is loaded into the store.
	$effect.pre(() => {
		const resolvedThemes = resolveThemes(editorProps.themes)
		registerColorsFromThemes(resolvedThemes)
		registerFontsFromThemes(resolvedThemes)
	})

	let container = $state.raw<HTMLElement | null>(null)
	let portalHost = $state.raw<HTMLElement | null>(null)
	setEditorPortalHost(() => portalHost)

	const user = $derived(editorProps.user ?? createTLCurrentUser())

	const ErrorFallback = $derived(
		editorProps.components?.ErrorFallback === undefined
			? DefaultErrorFallback
			: editorProps.components.ErrorFallback
	)

	// Merge deprecated props with options (options win). `options` is a dependency of the
	// editor-creating effect, so it's shallow-stabilised below; the nested objects are
	// deep-stabilised here first, or an inline `options={{ camera: { ... } }}` would still
	// recreate the editor on every render. `text` needs the deep comparison as well: `<SvelteDraw>`
	// builds a fresh `tipTapConfig` inside it whenever its own `options.text` is a new identity.
	const camera = deepObjectIdentity(() => editorProps.options?.camera)
	const gridSteps = deepObjectIdentity(() => editorProps.options?.gridSteps)
	const text = deepObjectIdentity(() => editorProps.options?.text ?? editorProps.textOptions)
	const mergedDeepLinks = $derived(editorProps.options?.deepLinks ?? editorProps.deepLinks)
	const deepLinkOptions = deepObjectIdentity(() =>
		mergedDeepLinks === true ? undefined : mergedDeepLinks
	)
	const deepLinks = $derived(mergedDeepLinks === true ? true : deepLinkOptions.current)
	const mergedOptions = $derived.by(() => {
		let merged = editorProps.options
		if (camera.current !== undefined) merged = { ...merged, camera: camera.current }
		if (gridSteps.current !== undefined) merged = { ...merged, gridSteps: gridSteps.current }
		if (text.current !== undefined) merged = { ...merged, text: text.current }
		if (deepLinks !== undefined) merged = { ...merged, deepLinks }
		return merged
	})
	const options = shallowObjectIdentity(() => mergedOptions)
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	bind:this={container}
	data-svelte-draw={version}
	draggable={false}
	class={[`${TL_CONTAINER_CLASS} tl-theme__light`, editorProps.className]}
	tabindex={-1}
	role="application"
	aria-label={editorProps.options?.branding ?? 'svelte-draw'}
>
	<OptionalErrorBoundary
		fallback={ErrorFallback ?? null}
		onError={(error) => annotateError(error, { tags: { origin: 'svelte.svelte-draw-before-app' } })}
	>
		{#if container}
			<LicenseProvider licenseKey={editorProps.licenseKey}>
				<EditorHost {container} props={editorProps} {user} options={options.current} />
			</LicenseProvider>
		{/if}
	</OptionalErrorBoundary>
	<!--
		The host for <EditorPortal>, last among the container's children so that anything portaled
		through it lands after the canvas and the UI, behind the UI's "skip to main content" link in
		the tab order, which only works while nothing precedes it.
	-->
	<div class="tl-portal-host" bind:this={portalHost}></div>
</div>
