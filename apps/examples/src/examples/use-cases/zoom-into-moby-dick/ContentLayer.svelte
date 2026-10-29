<script lang="ts" module>
	/**
	 * How much later the rules between cells arrive than the text they divide.
	 *
	 * A hairline reads as present at an opacity where text still reads as absent, so
	 * sharing one number makes the grid seem to snap in ahead of the level it
	 * belongs to. Raising the rules to a power holds them back until their level is
	 * most of the way in.
	 */
	const RULE_GAMMA = 2.6
</script>

<script lang="ts">
	import { Box, fromComputed, fromSignal, getEditor, react, type Atom } from 'svelte-draw'
	import type { Attachment } from 'svelte/attachments'
	import {
		type Corpus,
		detailNode,
		detailZoom,
		type Layout,
		levelOpacities,
		type PlacedNode,
	} from './layout'
	import { openNode } from './navigation'
	import NodeView from './NodeView.svelte'

	let {
		layout,
		corpus,
		matches,
	}: {
		layout: Layout
		corpus: Corpus
		matches: Atom<ReadonlySet<string>>
	} = $props()

	const editor = getEditor()
	const highlighted = $derived(fromSignal(matches))

	/**
	 * Every node at a depth shares that depth's opacity, so the crossfade costs one
	 * style write per camera frame instead of a render per node.
	 */
	$effect(() => {
		const nominals = layout.nominals
		const container = editor.getContainer()
		return react('semantic zoom level of detail', () => {
			const opacities = levelOpacities(nominals, editor.getZoomLevel())
			for (let depth = 0; depth < opacities.length; depth++) {
				const opacity = opacities[depth]
				container.style.setProperty(`--lod-${depth}`, opacity.toFixed(3))
				// Fully faded levels must stop painting, not just go transparent —
				// one level alone can be hundreds of blocks of text.
				container.style.setProperty(`--lod-${depth}-vis`, opacity < 0.005 ? 'hidden' : 'visible')

				const rule = Math.pow(opacity, RULE_GAMMA)
				container.style.setProperty(`--rule-${depth}`, rule.toFixed(3))
				container.style.setProperty(`--rule-${depth}-vis`, rule < 0.005 ? 'hidden' : 'visible')
			}
		})
	})

	const loadZoom = $derived(detailZoom(layout.nominals))
	const isDeep = fromComputed('is deep', () => editor.getZoomLevel() >= loadZoom)

	let detail = $state.raw<Record<string, string> | null>(null)
	$effect(() => {
		if (!isDeep.current || detail || !corpus.loadDetail) return
		let cancelled = false
		corpus.loadDetail().then(
			(loaded) => {
				if (!cancelled) detail = loaded
			},
			(error) => console.error('could not load the detail text', error)
		)
		return () => {
			cancelled = true
		}
	})

	// Returns a string so that panning within the same few leaves doesn't produce
	// a new array identity and re-render the whole layer.
	const visibleLeafIds = fromComputed('visible leaves', () => {
		if (editor.getZoomLevel() < loadZoom) return ''
		const viewport = editor.getViewportPageBounds()
		return layout.leaves
			.filter((leaf) => viewport.collides(Box.From(leaf.rect)))
			.map((leaf) => leaf.id)
			.join(',')
	})

	const detailLevels = $derived.by(() => {
		if (!detail || !visibleLeafIds.current) return []
		const wanted = new Set(visibleLeafIds.current.split(','))
		return layout.leaves
			.filter((leaf) => wanted.has(leaf.id))
			.flatMap((leaf) => {
				const text = detail![leaf.detailKey!]
				return text ? [detailNode(leaf, text)] : []
			})
	})

	const isSelecting = fromComputed('is selecting', () => editor.getCurrentToolId() === 'select')
	const onSelect = $derived(
		isSelecting.current ? (node: PlacedNode) => openNode(editor, layout, node) : undefined
	)
</script>

<div class={`sz-layer${isSelecting.current ? ' sz-layer--interactive' : ''}`}>
	{#each layout.separators as rule, i (i)}
		<div
			class="sz-rule"
			style:transform="translate({rule.x}px, {rule.y}px)"
			style:width="{rule.w}px"
			style:height="{rule.h}px"
			style:opacity="var(--rule-{rule.depth})"
			style:visibility="var(--rule-{rule.depth}-vis)"
		></div>
	{/each}
	{#each layout.nodes as node (node.id)}
		<NodeView {node} matched={highlighted.current.has(node.id)} {onSelect} />
	{/each}
	{#each detailLevels as node (node.id)}
		<NodeView {node} matched={false} isDetail />
	{/each}
</div>
