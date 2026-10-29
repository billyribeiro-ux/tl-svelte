<script lang="ts">
	import 'svelte-draw/svelte-draw.css'
	import './pdf-editor/pdf-editor.css'
	import PdfEditor from './pdf-editor/PdfEditor.svelte'
	import PdfPicker, { type Pdf } from './pdf-editor/PdfPicker.svelte'

	type State =
		| {
				phase: 'pick'
		  }
		| {
				phase: 'edit'
				pdf: Pdf
		  }

	let current = $state.raw<State>({ phase: 'pick' })
</script>

<div class="PdfEditor">
	{#if current.phase === 'pick'}
		<PdfPicker onOpenPdf={(pdf) => (current = { phase: 'edit', pdf })} />
	{:else}
		<PdfEditor pdf={current.pdf} />
	{/if}
</div>

<!--
This example is built on top of the pdf-editor example; a copy of those files lives in the
`pdf-editor` folder here. On top of that it adds:

- `add-mark-util.ts`: the `exam-mark` shape, a numeric score input.
- `add-mark-tool.ts`: a tool that places an exam mark where you click.
- `ExamScoreLabel.svelte`: a widget that sums every exam mark on the page.
- `ui-overrides.ts`: adds the tool to the toolbar and keyboard shortcuts dialog.
-->
