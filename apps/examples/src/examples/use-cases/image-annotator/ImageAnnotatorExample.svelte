<script lang="ts">
	import 'svelte-draw/svelte-draw.css'
	import ImageAnnotationEditor from './ImageAnnotationEditor.svelte'
	import ImageExport from './ImageExport.svelte'
	import ImagePicker from './ImagePicker.svelte'
	import './image-annotator.css'
	import type { AnnotatorImage } from './types'

	type State =
		| {
				phase: 'pick'
		  }
		| {
				phase: 'annotate'
				id: string
				image: AnnotatorImage
		  }
		| {
				phase: 'export'
				result: Blob
		  }

	let current = $state.raw<State>({ phase: 'pick' })
</script>

<div class="ImageAnnotator">
	{#if current.phase === 'pick'}
		<ImagePicker
			onChooseImage={(image) =>
				(current = { phase: 'annotate', image, id: Math.random().toString(36) })}
		/>
	{:else if current.phase === 'annotate'}
		<!-- remount svelte-draw when a new image is chosen -->
		{#key current.id}
			<ImageAnnotationEditor
				image={current.image}
				onDone={(result) => (current = { phase: 'export', result })}
			/>
		{/key}
	{:else}
		<ImageExport result={current.result} onStartAgain={() => (current = { phase: 'pick' })} />
	{/if}
</div>
