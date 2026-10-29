<script lang="ts">
	import { getEditor, SvelteDrawUiButton, type Atom } from 'svelte-draw'
	import Breadcrumb from './Breadcrumb.svelte'
	import type { Layout, PlacedNode } from './layout'
	import { goToNode, goToWhole } from './navigation'
	import ZoomSlider from './ZoomSlider.svelte'

	interface Hit {
		node: PlacedNode
		preview: string
	}

	function search(layout: Layout, query: string): Hit[] {
		const needle = query.trim().toLowerCase()
		if (needle.length < 2) return []
		const hits: Hit[] = []
		for (const node of layout.nodes) {
			const haystack = `${node.label ?? ''} ${node.title ?? ''} ${node.text}`
			const at = haystack.toLowerCase().indexOf(needle)
			if (at === -1) continue
			const from = Math.max(0, at - 30)
			hits.push({
				node,
				preview: (from > 0 ? '…' : '') + haystack.slice(from, at + needle.length + 50).trim() + '…',
			})
			if (hits.length >= 60) break
		}
		// Coarsest first: the reader wants to know which part of the work a word
		// lives in before being dropped into one paragraph of it.
		return hits.sort((a, b) => a.node.depth - b.node.depth)
	}

	let { layout, matches }: { layout: Layout; matches: Atom<ReadonlySet<string>> } = $props()

	const editor = getEditor()
	let query = $state('')

	const hits = $derived(search(layout, query))
	// Another component's signal. Only publish when the set actually changed, or every
	// keystroke re-renders every node on the canvas — including the ones that matched
	// before and still do.
	$effect(() => {
		const ids = new Set(hits.map((hit) => hit.node.id))
		const current = matches.get()
		if (ids.size === current.size && [...ids].every((id) => current.has(id))) return
		matches.set(ids)
	})
</script>

<div class="sz-controls">
	<div class="sz-bar">
		<ZoomSlider {layout} />
		<SvelteDrawUiButton type="normal" onclick={() => goToWhole(editor, layout)}>
			Whole thing
		</SvelteDrawUiButton>
		<input class="sz-search" bind:value={query} placeholder="Search every level…" />
	</div>
	{#if hits.length > 0}
		<ul class="sz-hits">
			{#each hits.slice(0, 10) as hit (hit.node.id)}
				<li>
					<button onclick={() => goToNode(editor, layout, hit.node)}>
						<span class="sz-hit-where">
							{hit.node.label ?? hit.node.title ?? `level ${hit.node.depth}`}
						</span>
						<span class="sz-hit-text">{hit.preview}</span>
					</button>
				</li>
			{/each}
			{#if hits.length > 10}<li class="sz-hits-more">and {hits.length - 10} more</li>{/if}
		</ul>
	{/if}
	<Breadcrumb {layout} />
</div>
