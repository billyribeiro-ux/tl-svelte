<script lang="ts">
	import {
		getLicenseKey,
		type ThumbnailRenderParams,
	} from '@svelte-draw/dotcom-shared'
	import { SvelteDraw, type SerializedSchema, type TLRecord } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { assetUrls } from '../../utils/assetUrls'
	import { embedShapeUtils } from '../../utils/embedShapeUtil'
	import {
		applyThumbnailPageSize,
		clampThumbnailDimension,
		mountThumbnailEditor,
	} from '../thumbnail-render'
	import ThumbnailExportSignal from './ThumbnailExportSignal.svelte'
	import ThumbnailImage from './ThumbnailImage.svelte'
	import ThumbnailMeasureSignal from './ThumbnailMeasureSignal.svelte'
	import ThumbnailRenderCrash from './ThumbnailRenderCrash.svelte'

	let {
		token,
		records,
		schema,
		renderParams,
	}: {
		token: string
		records: TLRecord[]
		schema: SerializedSchema
		renderParams: ThumbnailRenderParams
	} = $props()

	const width = $derived(clampThumbnailDimension(renderParams.width))
	const height = $derived(clampThumbnailDimension(renderParams.height))
	const theme = $derived(renderParams.theme === 'dark' ? 'dark' : 'light')

	$effect(() => applyThumbnailPageSize(width, height))

	const snapshot = $derived({
		schema,
		store: Object.fromEntries(records.map((record) => [record.id, record])),
	})

	// Once the export is ready it's shown as a full-viewport <img>, so the worker's Browser Rendering
	// screenshot captures the exact editor.toImage output rather than the live editor canvas. An
	// object URL, not a data URL: blobToDataUrl base64-encodes the whole PNG on the main thread,
	// which on a heavy board is megabytes of string work standing between the export and the ready
	// marker. Never revoked — the page exists for exactly one render.
	let imageUrl = $state<string | null>(null)
	async function handleImage(blob: Blob) {
		imageUrl = URL.createObjectURL(blob)
	}
</script>

{#if imageUrl}
	<ThumbnailImage src={imageUrl} {width} {height} />
{:else}
	<div
		style:width="{width}px"
		style:height="{height}px"
		style:overflow="hidden"
		style:background={theme === 'dark' ? '#1d1d1d' : 'white'}
	>
		<SvelteDraw
			hideUi
			licenseKey={getLicenseKey()}
			{assetUrls}
			shapeUtils={embedShapeUtils}
			components={{ ErrorFallback: ThumbnailRenderCrash }}
			{snapshot}
			onMount={(editor) => mountThumbnailEditor(editor, renderParams, theme, width, height)}
		>
			{#if renderParams.mode === 'measure'}
				<ThumbnailMeasureSignal {token} />
			{:else}
				<ThumbnailExportSignal
					{theme}
					{width}
					{height}
					camera={renderParams.camera}
					shapeIds={renderParams.shapeIds}
					capture={renderParams.capture}
					onImage={handleImage}
				/>
			{/if}
		</SvelteDraw>
	</div>
{/if}
