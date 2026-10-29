<script lang="ts">
	import { fromComputed, type Editor } from 'svelte-draw'
	import RegionBox from './RegionBox.svelte'
	import { regionDraft } from './state'

	/** The live region being dragged out by the comment tool, or nothing when not dragging. */
	let { editor }: { editor: Editor } = $props()

	const box = fromComputed('region draft', () => regionDraft.get(editor))
</script>

{#if box.current}
	<RegionBox {editor} box={box.current} />
{/if}
