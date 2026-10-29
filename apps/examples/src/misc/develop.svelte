<script lang="ts" module>
	import { commentToolOverrides, CommentTool } from '@svelte-draw/commenting'
	import {
		type Editor,
		type TLComponents,
		type TLShape,
		getFromSessionStorage,
		setInSessionStorage,
	} from 'svelte-draw'
	import { trackedShapes } from '../hooks/useDebugging'
	import { getDiff } from './diff'
	import DevelopComments from './DevelopComments.svelte'
	import DevelopContextMenu from './DevelopContextMenu.svelte'
	import DevelopDebugMenu from './DevelopDebugMenu.svelte'

	const components: TLComponents = {
		ContextMenu: DevelopContextMenu,
		DebugMenu: DevelopDebugMenu,
		InFrontOfTheCanvas: DevelopComments,
	}

	// Dragging the comment tool out anchors a comment to a rectangular region; a click anchors a pin.
	const tools = [CommentTool.configure({ enableRegions: true })]

	// Debug mode is on by default on this page. The default is applied once per
	// browser tab so that turning debug mode off still sticks across reloads.
	const DEBUG_MODE_DEFAULT_KEY = 'svelteDraw_develop_debug_mode_default_applied'

	function turnOnDebugModeByDefault(editor: Editor) {
		if (getFromSessionStorage(DEBUG_MODE_DEFAULT_KEY)) return
		setInSessionStorage(DEBUG_MODE_DEFAULT_KEY, 'true')
		editor.updateInstanceState({ isDebugMode: true })
	}

	function afterChangeHandler(prev: TLShape, next: TLShape) {
		const tracked = trackedShapes.get()
		if (tracked.includes(next.id)) {
			// eslint-disable-next-line no-console
			console.table(getDiff(prev, next))
		}
	}
</script>

<script lang="ts">
	import { getLicenseKey } from '@svelte-draw/dotcom-shared'
	import {
		PerformanceApiAdapter,
		SvelteDraw,
		commentSchemaRecords,
		createLocalStore,
		createTLSchema,
	} from 'svelte-draw'
	import '@svelte-draw/commenting/commenting.css'
	import 'svelte-draw/svelte-draw.css'
	import { useDebugging } from '../hooks/useDebugging'
	import { usePerformance } from '../hooks/usePerformance.svelte'

	const performanceOverrides = usePerformance()
	const debuggingOverrides = useDebugging()

	// The comment records live in the store alongside shapes, so the schema needs them registered
	// before the persisted document loads. That makes this schema newer than the default one, so
	// no other example may share the 'example' persistence key: a newer-schema tab ignores an
	// older tab's changes and overwrites the shared database with its own copy (#10514).
	const schema = createTLSchema({ records: commentSchemaRecords })
	const store = createLocalStore(() => ({ persistenceKey: 'example', schema }))

	const w = window as unknown as { app?: Editor; editor?: Editor; $s?: unknown }
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		licenseKey={getLicenseKey()}
		overrides={[performanceOverrides.current, debuggingOverrides, commentToolOverrides]}
		store={store.current}
		{tools}
		{components}
		onMount={(editor) => {
			w.app = editor
			w.editor = editor

			turnOnDebugModeByDefault(editor)

			Object.defineProperty(window, '$s', {
				get: function () {
					return editor.getOnlySelectedShape()
				},
				configurable: true,
				enumerable: true,
			})

			const dispose = editor.store.sideEffects.registerAfterChangeHandler(
				'shape',
				afterChangeHandler
			)

			const perfAdapter = new PerformanceApiAdapter(editor.performance)

			return () => {
				dispose()
				perfAdapter.dispose()
			}
		}}
	/>
</div>
