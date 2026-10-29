<script lang="ts">
	import { getEditor } from 'svelte-draw'
	import { exportPdf } from './exportPdf'
	import { getPdf } from './pdfContext'

	const editor = getEditor()
	const pdf = getPdf()

	let exportProgress = $state<number | null>(null)
</script>

<button
	class="ExportPdfButton"
	onclick={async () => {
		exportProgress = 0
		try {
			await exportPdf(editor, pdf.current, (progress) => (exportProgress = progress))
		} finally {
			exportProgress = null
		}
	}}
>
	{exportProgress ? `Exporting... ${Math.round(exportProgress * 100)}%` : 'Export PDF'}
</button>
