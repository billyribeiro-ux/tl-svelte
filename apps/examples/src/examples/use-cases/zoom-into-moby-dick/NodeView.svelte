<script lang="ts">
	import { on } from 'svelte/events'
	import type { Attachment } from 'svelte/attachments'
	import type { PlacedNode } from './layout'

	/** Font size every node is laid out at before its own transform scales it. */
	const LOGICAL_FONT = 16

	let {
		node,
		matched,
		isDetail = false,
		onSelect,
	}: {
		node: PlacedNode
		matched: boolean
		isDetail?: boolean
		onSelect?(node: PlacedNode): void
	} = $props()

	const scale = $derived(node.fontSize / LOGICAL_FONT)

	// The editor container listens natively for pointerdown, and Svelte delegates `onpointerdown`
	// to the app root, which runs after it. Stopping the event has to happen on the element itself.
	const select: Attachment<HTMLDivElement> = (elm) => {
		if (!onSelect) return
		return on(elm, 'pointerdown', (e) => {
			e.stopPropagation()
			onSelect(node)
		})
	}
</script>

<div
	{@attach select}
	class={`sz-node sz-node--depth-${node.depth}` +
		(isDetail ? ' sz-node--detail' : '') +
		(matched ? ' sz-node--match' : '')}
	style:transform="translate({node.rect.x}px, {node.rect.y}px) scale({scale})"
	style:width="{node.rect.w / scale}px"
	style:height="{node.rect.h / scale}px"
	style:font-size="{LOGICAL_FONT}px"
	style:column-count={node.columns}
	style:opacity="var(--lod-{node.depth})"
	style:visibility="var(--lod-{node.depth}-vis)"
>
	{#if node.title}<h2 class="sz-title">{node.title}</h2>{/if}
	{#each node.text.split('\n\n') as paragraph, i (i)}
		<p>{paragraph}</p>
	{/each}
</div>
