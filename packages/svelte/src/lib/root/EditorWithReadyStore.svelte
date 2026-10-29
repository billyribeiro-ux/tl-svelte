<script lang="ts">
	import { Editor, defaultI18n, getGlobalDocument, type TLCurrentUser, type TLI18nAdapter } from '@svelte-draw/editor'
	import type { SvelteDrawOptions } from '@svelte-draw/editor'
	import type { TLStore, TLTheme } from '@svelte-draw/tlschema'
	import { untrack } from 'svelte'
	import { getEditorComponents } from '../canvas/componentsContext'
	import OptionalErrorBoundary from '../canvas/OptionalErrorBoundary.svelte'
	import { getContainer } from '../context/editor'
	import Crash from './Crash.svelte'
	import EditorLayout from './EditorLayout.svelte'
	import EditorProvider from './EditorProvider.svelte'
	import { setEditorI18nFallback, type EditorI18nFallback } from './i18nFallback'
	import { shallowObjectIdentity } from './identity.svelte'
	import { getLicenseManagerAccessor } from './license/licenseContext'
	import Watermark from './license/Watermark.svelte'
	import type { SvelteDrawEditorAllProps } from './types'

	let {
		props,
		store,
		user,
		options,
	}: {
		props: SvelteDrawEditorAllProps
		store: TLStore
		user: TLCurrentUser
		options: Partial<SvelteDrawOptions> | undefined
	} = $props()

	const EMPTY_SHAPE_UTILS_ARRAY = [] as const
	const EMPTY_BINDING_UTILS_ARRAY = [] as const
	const EMPTY_ASSET_UTILS_ARRAY = [] as const
	const EMPTY_TOOLS_ARRAY = [] as const

	const noAutoFocus = () =>
		getGlobalDocument().location.search.includes('svelteDraw_preserve_focus')

	const components = getEditorComponents()
	const container = getContainer()
	const getLicenseManager = getLicenseManagerAccessor()

	const shapeUtils = $derived(props.shapeUtils ?? EMPTY_SHAPE_UTILS_ARRAY)
	const bindingUtils = $derived(props.bindingUtils ?? EMPTY_BINDING_UTILS_ARRAY)
	const assetUtils = $derived(props.assetUtils ?? EMPTY_ASSET_UTILS_ARRAY)
	const tools = $derived(props.tools ?? EMPTY_TOOLS_ARRAY)
	const autoFocus = $derived(props.autoFocus ?? true)
	const ErrorFallback = $derived(components.ErrorFallback)
	const Canvas = $derived(components.Canvas)
	const LoadingScreen = $derived(components.LoadingScreen)

	let editor = $state.raw<Editor | null>(null)
	// only read when the editor is created, so it doesn't need to be reactive
	// svelte-ignore non_reactive_update
	let canvasRef: HTMLDivElement | null = null

	const deepLinks = shallowObjectIdentity(() => {
		const deepLinks = options?.deepLinks
		return deepLinks === true ? {} : deepLinks
	})

	// The adapter is called on each use rather than held as a value, so the editor can keep one
	// stable function that reads whichever adapter is current. Listing `i18n` among the deps that
	// recreate the editor instead tore it down (camera, selection, undo history) whenever the
	// adapter's identity changed, which is every render for one written inline.
	const fallbackI18n: EditorI18nFallback = { current: null }
	setEditorI18nFallback(fallbackI18n)
	const stableI18n: TLI18nAdapter = () => (props.i18n ?? fallbackI18n.current ?? defaultI18n)()

	$effect(() => {
		// if any of these change, we need to recreate the editor.
		const deps = {
			assetUtils,
			bindingUtils,
			colorScheme: props.colorScheme,
			container,
			options,
			overlayUtils: props.overlayUtils,
			shapeUtils,
			store,
			tools,
			user,
			licenseKey: props.licenseKey,
			licenseManager: getLicenseManager(),
			getShapeVisibility: props.getShapeVisibility,
			assetUrls: props.assetUrls,
		}

		return untrack(() => {
			// props read here can change without causing the editor to be recreated. Some are only
			// used when the editor first mounts; the rest are kept up to date by separate effects.
			const newEditor = new Editor({
				store: deps.store,
				shapeUtils: deps.shapeUtils,
				bindingUtils: deps.bindingUtils,
				assetUtils: deps.assetUtils,
				overlayUtils: deps.overlayUtils,
				tools: deps.tools,
				getContainer: () => deps.container,
				user: deps.user,
				initialState: props.initialState,
				// we should check for some kind of query parameter that turns off autofocus
				autoFocus: autoFocus && !noAutoFocus(),
				cameraOptions: props.cameraOptions,
				options: deps.options,
				licenseKey: deps.licenseKey,
				getShapeVisibility: deps.getShapeVisibility,
				colorScheme: deps.colorScheme,
				fontAssetUrls: deps.assetUrls?.fonts,
				themes: props.themes,
				initialTheme: props.initialTheme,
				i18n: stableI18n,
			})
			newEditor.licenseManager = deps.licenseManager

			newEditor.updateViewportScreenBounds(canvasRef ?? deps.container)

			// We only want to do this once when the editor is created. We don't want changes to the
			// deepLinks option to trigger creating new editors.
			const initialDeepLinks = deepLinks.current
			if (initialDeepLinks) {
				if (!initialDeepLinks.getUrl) {
					// load the state from window.location
					newEditor.navigateToDeepLink(initialDeepLinks)
				} else {
					// load the state from the provided URL
					newEditor.navigateToDeepLink({
						...initialDeepLinks,
						url: initialDeepLinks.getUrl(newEditor),
					})
				}
			}

			editor = newEditor

			return () => {
				newEditor.dispose()
			}
		})
	})

	$effect(() => {
		const currentEditor = editor
		const currentDeepLinks = deepLinks.current
		if (!currentEditor) return
		if (currentDeepLinks) {
			return currentEditor.registerDeepLinkListener(currentDeepLinks)
		}
		return undefined
	})

	// keep the editor up to date with the latest camera options
	// options.cameraOptions takes precedence over the deprecated cameraOptions prop
	$effect(() => {
		const currentEditor = editor
		const cameraOptions = props.cameraOptions
		const camera = options?.camera
		if (currentEditor && (cameraOptions || camera)) {
			currentEditor.setCameraOptions({ ...cameraOptions, ...camera })
		}
	})

	// keep the editor up to date with the latest theme definitions
	$effect(() => {
		const currentEditor = editor
		const themes = props.themes
		if (currentEditor && themes) {
			for (const def of Object.values(themes) as TLTheme[]) {
				currentEditor.updateTheme(def)
			}
		}
	})

	$effect(() => {
		const currentEditor = editor
		const initialTheme = props.initialTheme
		if (currentEditor && initialTheme) {
			currentEditor.setCurrentTheme(initialTheme)
		}
	})

	let crashState = $state.raw<{ editor: Editor; error: unknown } | null>(null)
	const crashingError = $derived(
		editor ? (crashState?.editor === editor ? crashState.error : (editor.getCrashingError() ?? null)) : null
	)
	$effect(() => {
		const currentEditor = editor
		if (!currentEditor) return
		const onCrash = () => {
			crashState = { editor: currentEditor, error: currentEditor.getCrashingError() ?? null }
		}
		currentEditor.on('crash', onCrash)
		return () => {
			currentEditor.off('crash', onCrash)
		}
	})

	// For our examples site, we want autoFocus to be true on the examples site, but not
	// when embedded in our docs site. If present, the `svelteDraw_preserve_focus` search param
	// overrides the `autoFocus` prop and prevents the editor from focusing immediately,
	// however here we also add some logic to focus the editor when the user clicks
	// on it and unfocus it when the user clicks away from it.
	$effect(function handleFocusOnPointerDownForPreserveFocusMode() {
		const currentEditor = editor
		const shouldAutoFocus = autoFocus
		if (!currentEditor) return
		const editorContainer = currentEditor.getContainer()

		function handleFocusOnPointerDown() {
			currentEditor!.focus()
		}

		function handleBlurOnPointerDown(e: PointerEvent) {
			// The same pointerdown bubbles from the container to the body; blurring here would
			// cancel the interaction the container listener just focused for. Check the composed
			// path rather than `e.target`: when the editor lives in an open shadow root the target
			// is retargeted to the shadow host by the time the event reaches the body. (A closed
			// shadow root truncates the path at the host, so those still blur.)
			if (e.composedPath().includes(editorContainer)) return
			currentEditor!.blur()
		}

		if (shouldAutoFocus && noAutoFocus()) {
			editorContainer.addEventListener('pointerdown', handleFocusOnPointerDown)
			editorContainer.ownerDocument.body.addEventListener('pointerdown', handleBlurOnPointerDown)

			return () => {
				editorContainer.removeEventListener('pointerdown', handleFocusOnPointerDown)
				editorContainer.ownerDocument.body.removeEventListener(
					'pointerdown',
					handleBlurOnPointerDown
				)
			}
		}
		return undefined
	})

	let fontLoadingState = $state.raw<{ editor: Editor; isLoaded: boolean } | null>(null)
	const isFontLoaded = $derived(
		fontLoadingState && fontLoadingState.editor === editor ? fontLoadingState.isLoaded : false
	)
	$effect(() => {
		const currentEditor = editor
		if (!currentEditor) return
		if (currentEditor.options.maxFontsToLoadBeforeRender === 0) {
			fontLoadingState = { editor: currentEditor, isLoaded: true }
			return
		}

		let isCancelled = false

		fontLoadingState = { editor: currentEditor, isLoaded: false }

		currentEditor.fonts
			.loadRequiredFontsForCurrentPage(currentEditor.options.maxFontsToLoadBeforeRender)
			.finally(() => {
				if (isCancelled) return
				fontLoadingState = { editor: currentEditor, isLoaded: true }
			})

		return () => {
			isCancelled = true
		}
	})
</script>

{#if !editor || !isFontLoaded}
	{#if LoadingScreen}
		<LoadingScreen />
	{/if}
	<div class="tl-canvas" bind:this={canvasRef}></div>
{:else}
	{@const readyEditor = editor}
	<!--
		the top-level svelte-draw component also renders an error boundary almost identical to this
		one. the reason we have two is because this one has access to `App`, which means that here we
		can enrich errors with data from app for reporting, and also still attempt to render the user's
		document in the event of an error to reassure them that their work is not lost.
	-->
	<OptionalErrorBoundary
		fallback={ErrorFallback ?? null}
		onError={(error) =>
			readyEditor.annotateError(error, { origin: 'svelte.svelte-draw', willCrashApp: true })}
	>
		{#if crashingError}
			<Crash error={crashingError} />
		{:else}
			<EditorProvider editor={readyEditor}>
				<EditorLayout onMount={props.onMount}>
					{#if props.children}
						{@render props.children()}
					{:else if Canvas}
						{#key readyEditor.contextId}
							<Canvas />
						{/key}
					{/if}
					<Watermark />
				</EditorLayout>
			</EditorProvider>
		{/if}
	</OptionalErrorBoundary>
{/if}
