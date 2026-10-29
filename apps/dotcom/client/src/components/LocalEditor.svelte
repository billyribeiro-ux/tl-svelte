<script lang="ts">
	import { getLicenseKey } from '@svelte-draw/dotcom-shared'
	import type { Snippet } from 'svelte'
	import {
		SvelteDraw,
		type Editor,
		type SvelteDrawOptions,
		type TLComponents,
		type TLUiOverrides,
	} from 'svelte-draw'
	import SneakyToolSwitcher from '../tla/components/TlaEditor/sneaky/SneakyToolSwitcher.svelte'
	import { getExtraDragIconOverrides } from '../tla/components/TlaEditor/useExtraToolDragIcons.svelte'
	import { getFileEditorOverrides } from '../tla/components/TlaEditor/useFileEditorOverrides.svelte'
	import { getHandleUiEvents } from '../utils/analytics'
	import { assetUrls } from '../utils/assetUrls'
	import { createAssetFromUrl } from '../utils/createAssetFromUrl'
	import { getScratchPersistenceKey } from '../utils/scratch-persistence-key'
	import SneakyMermaidHandler from './SneakyMermaidHandler/SneakyMermaidHandler.svelte'
	import SneakyOnDropOverride from './SneakyOnDropOverride.svelte'
	import ThemeUpdater from './ThemeUpdater/ThemeUpdater.svelte'

	let {
		components,
		onMount,
		children,
		persistenceKey,
		'data-testid': dataTestId,
		options,
		overrides,
	}: {
		components: TLComponents
		onMount?(editor: Editor): void | (() => void)
		children?: Snippet
		persistenceKey?: string
		'data-testid'?: string
		options?: Partial<SvelteDrawOptions>
		/** Composed after the file-system and drag-icon overrides every local editor gets. */
		overrides?: TLUiOverrides[]
	} = $props()

	const handleUiEvent = getHandleUiEvents()
	const fileSystemUiOverrides = getFileEditorOverrides({})
	const extraDragIconOverrides = getExtraDragIconOverrides()
	const editorOverrides = $derived([
		fileSystemUiOverrides.current,
		extraDragIconOverrides.current,
		...(overrides ?? []),
	])

	function handleMount(editor: Editor) {
		const w = window as Window & { app?: Editor; editor?: Editor }
		w.app = editor
		w.editor = editor
		editor.registerExternalAssetHandler('url', createAssetFromUrl)
		return onMount?.(editor)
	}
</script>

<div class="svelte-draw__editor" data-testid={dataTestId}>
	<SvelteDraw
		licenseKey={getLicenseKey()}
		{assetUrls}
		persistenceKey={persistenceKey ?? getScratchPersistenceKey()}
		onMount={handleMount}
		overrides={editorOverrides}
		onUiEvent={handleUiEvent}
		{components}
		{options}
	>
		<SneakyOnDropOverride isMultiplayer={false} />
		<SneakyToolSwitcher />
		<SneakyMermaidHandler />
		<ThemeUpdater />
		{@render children?.()}
	</SvelteDraw>
</div>
