<script lang="ts">
	import {
		getEditor,
		getEditorComponents,
		setupOnMount,
		type TLOnMountHandler,
	} from '@svelte-draw/svelte'
	import {
		registerDefaultExternalContentHandlers,
		type TLExternalContentProps,
	} from './defaultExternalContentHandlers'
	import { registerDefaultSideEffects } from './defaultSideEffects'
	import { allDefaultFontFaces } from './shapes/shared/defaultFonts'
	import { getToasts } from './ui/context/toasts'
	import { getUiComponents } from './ui/context/components'
	import { getUiEvents } from './ui/context/events'
	import { getTranslation } from './ui/hooks/useTranslation/useTranslation.svelte'

	// The hooks in the React `InsideOfEditorAndUiContext` need the context provided by
	// `SvelteDrawEditor` and `SvelteDrawUi`, so they live in a component rendered inside both.
	let {
		maxImageDimension,
		maxAssetSize,
		acceptedImageMimeTypes,
		acceptedVideoMimeTypes,
		onMount,
	}: TLExternalContentProps & {
		onMount?: TLOnMountHandler
	} = $props()

	const editor = getEditor()
	const toasts = getToasts()
	// The handlers are registered once, at mount, so they must read the current translation
	// rather than the one in place then, which is English until the locale's catalog loads.
	// `msg` looks the catalog up on every call, so it already follows the locale.
	const msg = getTranslation()
	const trackEvent = getUiEvents()
	// Read through the objects (not destructured) so an override that changes is followed.
	const editorComponents = getEditorComponents()
	const uiComponents = getUiComponents()

	// `setupOnMount` reads the handler once, untracked, so the props below are captured at mount.
	setupOnMount(editor, () => () => {
		const unsubs: (void | (() => void) | undefined)[] = []

		unsubs.push(registerDefaultSideEffects(editor))

		// now that the editor has mounted (and presumably pre-loaded the fonts actually in use in
		// the document), we want to preload the other default font faces in the background. These
		// won't be directly used, but mean that when adding text the user can switch between fonts
		// quickly, without having to wait for them to load in.
		editor.fonts.requestFonts(allDefaultFontFaces)

		// Also preload any custom font faces defined in themes
		const themes = editor.getThemes()
		for (const theme of Object.values(themes)) {
			for (const key of Object.keys(theme.fonts)) {
				const font = theme.fonts[key as keyof typeof theme.fonts]
				if (font.faces?.length) {
					editor.fonts.requestFonts(font.faces)
				}
			}
		}

		editor.once('edit', () => trackEvent('edit', { source: 'unknown' }))

		// for content handling, first we register the default handlers...
		registerDefaultExternalContentHandlers(editor, {
			maxImageDimension,
			maxAssetSize,
			acceptedImageMimeTypes,
			acceptedVideoMimeTypes,
			toasts,
			msg,
		})

		// ...then we call the store's on mount which may override them...
		unsubs.push(editor.store.props.onMount(editor))

		// ...then we run the user's onMount prop, which may override things again.
		unsubs.push(onMount?.(editor))

		return () => {
			unsubs.forEach((fn) => fn?.())
		}
	})

	const ContextMenu = $derived(uiComponents.ContextMenu)
	const Canvas = $derived(editorComponents.Canvas)
</script>

{#if ContextMenu}
	<!-- should wrap canvas -->
	<ContextMenu />
{:else if Canvas}
	<Canvas />
{/if}
