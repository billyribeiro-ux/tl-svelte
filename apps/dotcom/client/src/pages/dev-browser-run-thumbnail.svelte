<script lang="ts">
	import { DEFAULT_THUMBNAIL_HEIGHT, DEFAULT_THUMBNAIL_WIDTH } from '@svelte-draw/dotcom-shared'
	import {
		FileHelpers,
		SvelteDraw,
		defaultShapeUtils,
		type TLEditorSnapshot,
		type TLStoreSnapshot,
	} from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import snapshotExampleSnapshot from '../../../../examples/src/examples/editor-api/snapshots/snapshot.json'
	import layerPanelSnapshot from '../../../../examples/src/examples/ui/layer-panel/snapshot.json'
	import { applyThumbnailPageSize, clampThumbnailDimension } from './thumbnail-render'
	import ThumbnailExportSignal from './thumbnail/ThumbnailExportSignal.svelte'
	import ThumbnailPreview from './thumbnail/ThumbnailPreview.svelte'

	const fixtures = {
		'snapshot-example': {
			snapshot: snapshotExampleSnapshot as unknown as TLEditorSnapshot,
			camera: { x: 310, y: 120, z: 0.55 },
		},
		'layer-panel': {
			snapshot: layerPanelSnapshot as unknown as TLStoreSnapshot,
			camera: { x: 340, y: 120, z: 0.82 },
		},
	} as const

	type FixtureName = keyof typeof fixtures

	function getFixtureName(value: string | null): FixtureName {
		return value && value in fixtures ? (value as FixtureName) : 'snapshot-example'
	}

	function getCamera(params: URLSearchParams, fallback: { x: number; y: number; z: number }) {
		const x = getNumberParam(params, 'x')
		const y = getNumberParam(params, 'y')
		const z = getNumberParam(params, 'z')
		return {
			x: x ?? fallback.x,
			y: y ?? fallback.y,
			z: z ?? fallback.z,
		}
	}

	function getNumberParam(params: URLSearchParams, key: string) {
		const value = params.get(key)
		if (value === null) return null
		const number = Number(value)
		return Number.isFinite(number) ? number : null
	}

	function getDimensionParam(params: URLSearchParams, key: string, fallback: number) {
		const number = getNumberParam(params, key)
		if (number === null) return fallback
		return clampThumbnailDimension(number)
	}

	// Dev-only fixture variant of the production thumbnail render page. It renders allowlisted
	// example snapshots from plain query params so render behavior can be iterated on locally
	// without a sync worker, published file, or signed render token. There is no worker to upload
	// to here, so the editor.toImage output is shown as a full-viewport <img> (making a screenshot
	// of this page pixel-identical to the export) and exposed as a data URL for the capture script.
	const params = new URLSearchParams(location.search)
	const fixtureName = getFixtureName(params.get('fixture'))
	const fixture = fixtures[fixtureName]
	const width = getDimensionParam(params, 'width', DEFAULT_THUMBNAIL_WIDTH)
	const height = getDimensionParam(params, 'height', DEFAULT_THUMBNAIL_HEIGHT)
	const theme = params.get('theme') === 'dark' ? 'dark' : 'light'

	$effect(() => applyThumbnailPageSize(width, height))

	let dataUrl = $state<string | null>(null)
	async function handleImage(blob: Blob) {
		dataUrl = await FileHelpers.blobToDataUrl(blob)
	}
</script>

{#if dataUrl}
	<ThumbnailPreview {dataUrl} {width} {height} />
{:else}
	<div
		style:width="{width}px"
		style:height="{height}px"
		style:overflow="hidden"
		style:background={theme === 'dark' ? '#1d1d1d' : 'white'}
	>
		<SvelteDraw
			hideUi
			snapshot={fixture.snapshot}
			shapeUtils={defaultShapeUtils}
			onMount={(editor) => {
				editor.user.updateUserPreferences({ colorScheme: theme })
				editor.updateInstanceState({ isReadonly: true })
				editor.setCamera(getCamera(params, fixture.camera), { immediate: true })
			}}
		>
			<ThumbnailExportSignal {theme} {width} {height} onImage={handleImage} />
		</SvelteDraw>
	</div>
{/if}
