<script lang="ts" module>
	import type { TLComponents } from 'svelte-draw'
	import TlaEditorErrorFallback from './editor-components/TlaEditorErrorFallback.svelte'
	import TlaEditorPublishedSharePanel from './editor-components/TlaEditorPublishedSharePanel.svelte'
	import TlaEditorTopLeftPanel from './TlaEditorTopLeftPanel.svelte'
	import { withComponentProps } from './withComponentProps'

	const components: TLComponents = {
		ErrorFallback: TlaEditorErrorFallback,
		SharePanel: TlaEditorPublishedSharePanel,
		MenuPanel: withComponentProps(TlaEditorTopLeftPanel, { isAnonUser: true }),
	}
</script>

<script lang="ts">
	import { getLicenseKey } from '@svelte-draw/dotcom-shared'
	import { SvelteDraw, type Editor, type SerializedSchema, type TLRecord } from 'svelte-draw'
	import ThemeUpdater from '../../../components/ThemeUpdater/ThemeUpdater.svelte'
	import { setupLegacyUrlParams } from '../../../hooks/useLegacyUrlParams'
	import { setupPerformanceTracking } from '../../../hooks/usePerformanceTracking.svelte'
	import { getHandleUiEvents } from '../../../utils/analytics'
	import { assetUrls } from '../../../utils/assetUrls'
	import { embedShapeUtils } from '../../../utils/embedShapeUtil'
	import { globalEditor } from '../../../utils/globalEditor'
	import SneakyDarkModeSync from './sneaky/SneakyDarkModeSync.svelte'
	import TlaEditorWrapper from './TlaEditorWrapper.svelte'
	import { getFileEditorOverrides } from './useFileEditorOverrides.svelte'

	interface TlaPublishEditorProps {
		schema: SerializedSchema
		records: TLRecord[]
	}

	let { schema, records }: TlaPublishEditorProps = $props()

	// make sure this runs before the editor is instantiated
	setupLegacyUrlParams()

	const handleUiEvent = getHandleUiEvents()
	const trackPerformance = setupPerformanceTracking()
	const fileEditorOverrides = getFileEditorOverrides({})
	const editorOverrides = $derived([fileEditorOverrides.current])

	const snapshot = $derived({
		schema,
		store: Object.fromEntries(records.map((record) => [record.id, record])),
	})

	function handleMount(editor: Editor) {
		const w = window as Window & { app?: Editor; editor?: Editor }
		w.app = editor
		w.editor = editor
		editor.updateInstanceState({ isReadonly: true })
		globalEditor.set(editor)
		return trackPerformance(editor)
	}
</script>

<TlaEditorWrapper>
	<SvelteDraw
		licenseKey={getLicenseKey()}
		{assetUrls}
		shapeUtils={embedShapeUtils}
		{snapshot}
		overrides={editorOverrides}
		onUiEvent={handleUiEvent}
		onMount={handleMount}
		{components}
		options={{ deepLinks: true }}
	>
		<ThemeUpdater />
		<SneakyDarkModeSync />
	</SvelteDraw>
</TlaEditorWrapper>
