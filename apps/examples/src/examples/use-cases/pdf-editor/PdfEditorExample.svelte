<script lang="ts">
	import 'svelte-draw/svelte-draw.css'
	import PdfEditor from './PdfEditor.svelte'
	import PdfPicker, { type Pdf } from './PdfPicker.svelte'
	import './pdf-editor.css'

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
