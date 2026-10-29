<script lang="ts">
	import type { Editor } from '@svelte-draw/editor'
	import type { UseImageOrVideoAssetOptions } from '../../lib/shapes/shared/useImageOrVideoAsset.svelte'
	import AssetProbe from './AssetProbe.svelte'
	import TestEditorContext from './TestEditorContext.svelte'

	let {
		editor,
		container,
		options,
		sink,
	}: {
		editor: Editor
		container: HTMLElement
		options: UseImageOrVideoAssetOptions
		sink: { read?(): any }
	} = $props()
</script>

<TestEditorContext {editor} {container}>
	<AssetProbe {options} {sink} />
</TestEditorContext>
