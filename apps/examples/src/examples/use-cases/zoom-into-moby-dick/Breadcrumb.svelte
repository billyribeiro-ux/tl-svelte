<script lang="ts">
	import { fromComputed, getEditor } from 'svelte-draw'
	import { levelOpacities, type Layout } from './layout'
	import { goToNode, nodesContaining } from './navigation'

	let { layout }: { layout: Layout } = $props()

	const editor = getEditor()

	function shorten(text: string, words = 5) {
		const parts = text.split(/\s+/)
		return parts.slice(0, words).join(' ') + (parts.length > words ? '…' : '')
	}

	// Joined into a string because a fresh array every camera frame would
	// re-render the trail on every pan, identical or not.
	const trailIds = fromComputed('breadcrumb', () => {
		const { x, y } = editor.getViewportPageBounds().center
		const chain = nodesContaining(layout, x, y)
		// Stop at the level actually being read. The chain always runs to a
		// leaf, so without this the whole-work view claims to be showing
		// whichever leaf happens to sit under the middle of the screen.
		const opacities = levelOpacities(layout.nominals, editor.getZoomLevel())
		let deepest = 0
		opacities.forEach((opacity, depth) => {
			if (opacity > 0.5) deepest = depth
		})
		return chain
			.filter((node) => node.depth <= deepest)
			.map((node) => node.id)
			.join('\t')
	})
	const byId = $derived(new Map(layout.nodes.map((node) => [node.id, node])))
	const trail = $derived(trailIds.current ? trailIds.current.split('\t').map((id) => byId.get(id)!) : [])
</script>

{#if trail.length > 1}
	<div class="sz-crumbs">
		{#each trail as node, i (node.id)}
			<button
				class="sz-crumb"
				title="Zoom back out to here"
				onclick={() => goToNode(editor, layout, node)}
			>
				{#if i > 0}<span class="sz-crumb-sep">›</span>{/if}
				{node.label ?? node.title ?? shorten(node.text)}
			</button>
		{/each}
	</div>
{/if}
