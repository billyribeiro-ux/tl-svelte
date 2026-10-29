<script lang="ts" module>
	import { AssetRecordType, Box, createShapeId, type TLAssetId, type TLShapeId } from 'svelte-draw'

	export interface PdfPage {
		src: string
		bounds: Box
		assetId: TLAssetId
		shapeId: TLShapeId
	}

	export interface Pdf {
		name: string
		pages: PdfPage[]
		source: string | ArrayBuffer
	}
</script>

<script lang="ts">
	import PdfJSWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
	import svelteDrawPdf from './assets/svelte-draw.pdf'

	const pageSpacing = 32

	let { onOpenPdf }: { onOpenPdf(pdf: Pdf): void } = $props()

	let isLoading = $state(false)

	async function loadPdf(name: string, source: ArrayBuffer): Promise<Pdf> {
		const PdfJS = await import('pdfjs-dist')
		PdfJS.GlobalWorkerOptions.workerSrc = PdfJSWorkerSrc
	
		const pdf = await PdfJS.getDocument(source.slice(0)).promise
		const pages: PdfPage[] = []
	
		const canvas = window.document.createElement('canvas')
		const context = canvas.getContext('2d')
		if (!context) throw new Error('Failed to create canvas context')
	
		const visualScale = 1.5
		const scale = window.devicePixelRatio
	
		let top = 0
		let widest = 0
		for (let i = 1; i <= pdf.numPages; i++) {
			const page = await pdf.getPage(i)
			const viewport = page.getViewport({ scale: scale * visualScale })
			canvas.width = viewport.width
			canvas.height = viewport.height
			const renderContext = {
				canvasContext: context,
				viewport,
			}
			await page.render(renderContext).promise
	
			const width = viewport.width / scale
			const height = viewport.height / scale
			pages.push({
				src: canvas.toDataURL(),
				bounds: new Box(0, top, width, height),
				assetId: AssetRecordType.createId(),
				shapeId: createShapeId(),
			})
			top += height + pageSpacing
			widest = Math.max(widest, width)
		}
		canvas.width = 0
		canvas.height = 0
	
		for (const page of pages) {
			page.bounds.x = (widest - page.bounds.width) / 2
		}
	
		return {
			name,
			pages,
			source,
		}
	}

	function onClickOpenPdf() {
		const input = window.document.createElement('input')
		input.type = 'file'
		input.accept = 'application/pdf'
		input.addEventListener('change', async (e) => {
			const fileList = (e.target as HTMLInputElement).files
			if (!fileList || fileList.length === 0) return
			const file = fileList[0]
	
			isLoading = true
			try {
				const pdf = await loadPdf(file.name, await file.arrayBuffer())
				onOpenPdf(pdf)
			} finally {
				isLoading = false
			}
		})
		input.click()
	}
	
	async function onClickUseExample() {
		isLoading = true
		try {
			const result = await fetch(svelteDrawPdf)
			const pdf = await loadPdf('svelte-draw.pdf', await result.arrayBuffer())
			onOpenPdf(pdf)
		} finally {
			isLoading = false
		}
	}
</script>

{#if isLoading}
	<div class="PdfPicker">Loading...</div>
{:else}
	<div class="PdfPicker">
		<button onclick={onClickOpenPdf}>Open PDF</button>
		<div>or</div>
		<button onclick={onClickUseExample}>Use an example</button>
	</div>
{/if}
