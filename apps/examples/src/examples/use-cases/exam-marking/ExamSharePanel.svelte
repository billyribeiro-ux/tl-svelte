<script lang="ts">
	import ExamScoreLabel from './ExamScoreLabel.svelte'
	import ExportPdfButton from './pdf-editor/ExportPdfButton.svelte'
</script>

<div
	style="display: flex; flex-direction: row; align-items: center; gap: 8px; justify-content: normal; padding: 0px 6px;"
>
	<ExamScoreLabel />
	<ExportPdfButton />
</div>
