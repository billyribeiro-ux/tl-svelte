<script lang="ts">
	import { getLicenseKey } from '@svelte-draw/dotcom-shared'
	import {
		SvelteDraw,
		type Editor,
		type TLComponents,
		type TLStoreSnapshot,
	} from 'svelte-draw'
	import ThemeUpdater from '../../../components/ThemeUpdater/ThemeUpdater.svelte'
	import { setupLegacyUrlParams } from '../../../hooks/useLegacyUrlParams'
	import { getHandleUiEvents } from '../../../utils/analytics'
	import { assetUrls } from '../../../utils/assetUrls'
	import { embedShapeUtils } from '../../../utils/embedShapeUtil'
	import { globalEditor } from '../../../utils/globalEditor'
	import { getMaybeApp } from '../../hooks/useAppState.svelte'
	import { getSetIsReady } from '../../hooks/useIsReady.svelte'
	import SneakyDarkModeSync from './sneaky/SneakyDarkModeSync.svelte'
	import SneakyFileDropHandler from './sneaky/SneakyFileDropHandler.svelte'
	import SneakyLegacySetDocumentTitle from './sneaky/SneakyLegacytSetDocumentTitle.svelte'
	import TlaEditorWrapper from './TlaEditorWrapper.svelte'
	import { getFileEditorOverrides } from './useFileEditorOverrides.svelte'

	let { snapshot, components }: { snapshot: TLStoreSnapshot; components: TLComponents } = $props()

	const app = getMaybeApp()

	const setIsReady = getSetIsReady()

	// make sure this runs before the editor is instantiated
	setupLegacyUrlParams()

	const handleUiEvent = getHandleUiEvents()

	const fileSystemUiOverrides = getFileEditorOverrides({})
	const editorOverrides = $derived([fileSystemUiOverrides.current])

	function handleMount(editor: Editor) {
		const w = window as Window & { app?: Editor; editor?: Editor }
		w.app = editor
		w.editor = editor
		// Register the editor globally
		globalEditor.set(editor)
		editor.updateInstanceState({ isReadonly: true })
		setIsReady()
	}
</script>

<TlaEditorWrapper>
	<SvelteDraw
		className="tla-editor"
		licenseKey={getLicenseKey()}
		{snapshot}
		{assetUrls}
		shapeUtils={embedShapeUtils}
		onMount={handleMount}
		overrides={editorOverrides}
		initialState="hand"
		onUiEvent={handleUiEvent}
		{components}
		options={{ actionShortcutsLocation: 'toolbar', deepLinks: true }}
	>
		<ThemeUpdater />
		<SneakyDarkModeSync />
		<SneakyLegacySetDocumentTitle />
		{#if app.current}
			<SneakyFileDropHandler />
		{/if}
	</SvelteDraw>
</TlaEditorWrapper>
