<script lang="ts">
	import { on } from 'svelte/events'
	import {
		EASINGS,
		fromComputed,
		fromSignal,
		getEditor,
		type Editor,
		type TLShape,
		SvelteDrawUiButton,
	} from 'svelte-draw'
	import { showSearch } from './showSearch'

	interface SearchResult {
		text: string
		shape: TLShape
	}

	// [1]
	function getShapesWithText(editor: Editor): SearchResult[] {
		const results: SearchResult[] = []
		for (const shape of editor.getCurrentPageShapes()) {
			const shapeText = editor.getShapeUtil(shape).getText(shape)
			if (shapeText) results.push({ text: shapeText, shape })
		}
		return results
	}

	function moveToShape(editor: Editor, shape: TLShape) {
		editor.setSelectedShapes([shape.id])
		editor.zoomToSelection({
			animation: { duration: 500, easing: EASINGS.easeInOutCubic },
		})
	}

	const editor = getEditor()
	let searchText = $state('')
	const isVisible = fromSignal(showSearch)

	// [2]
	// The shapes' text is read inside a computed so that edits to text on the canvas update the
	// results, not just changes to the query. The query (Svelte state) is applied afterwards.
	const shapeTexts = fromComputed('text search shape texts', () => getShapesWithText(editor))
	const results = $derived.by(() => {
		if (!searchText) return []
		const query = searchText.toLowerCase()
		return shapeTexts.current
			.filter((r) => r.text.toLowerCase().includes(query))
			.sort((a, b) => a.text.localeCompare(b.text))
	})

	// Svelte delegates keydown and pointerdown, which would run after the editor container's own
	// native listeners, so these are attached natively to mark the events as handled in time.
	function panelEvents(node: HTMLElement) {
		const offPointer = on(node, 'pointerdown', editor.markEventAsHandled)
		const offKey = on(node, 'keydown', (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				searchText = ''
				showSearch.set(false)
			}
		})
		return () => {
			offPointer()
			offKey()
		}
	}
</script>

{#if isVisible.current}
	<div class="text-search-panel scroll-light" {@attach panelEvents}>
		<input
			class="text-search-input"
			bind:value={searchText}
			{@attach (input) => input.focus()}
		/>
		{#each results as result (result.shape.id)}
			<SvelteDrawUiButton
				type="normal"
				class="text-search-panel-button"
				onclick={() => moveToShape(editor, result.shape)}
			>
				{result.text}
			</SvelteDrawUiButton>
		{/each}
	</div>
{/if}
