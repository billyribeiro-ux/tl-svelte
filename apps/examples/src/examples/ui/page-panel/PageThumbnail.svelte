<script lang="ts">
	import { getEditor, type TLPageId } from 'svelte-draw'

	let { pageId }: { pageId: TLPageId } = $props()

	const editor = getEditor()
	let src = $state<string | null>(null)

	$effect(() => {
		const id = pageId
		let isCancelled = false
		let timeout: ReturnType<typeof setTimeout> | undefined

		// [5]
		async function generateThumbnail() {
			const shapeIds = editor.getPageShapeIds(id)
			if (shapeIds.size === 0) {
				if (!isCancelled) src = null
				return
			}
			const result = await editor.getSvgString([...shapeIds], {
				background: false,
				padding: 16,
			})
			if (isCancelled || !result) return
			src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(result.svg)}`
		}

		generateThumbnail()

		// [6]
		const removeListener = editor.store.listen(
			() => {
				if (editor.getCurrentPageId() !== id) return
				clearTimeout(timeout)
				timeout = setTimeout(generateThumbnail, 300)
			},
			{ scope: 'document', source: 'user' }
		)

		return () => {
			isCancelled = true
			clearTimeout(timeout)
			removeListener()
		}
	})
</script>

<div class="page-panel-thumbnail">
	{#if src}
		<img {src} alt="" />
	{:else}
		<span class="page-panel-thumbnail-empty">Empty</span>
	{/if}
</div>

<!--
[5]
The canvas never renders pages other than the current one, so we export them
as images instead. `editor.getPageShapeIds(pageId)` returns the
shape ids on any page (not just the current one), and `editor.getSvgString`
can export shapes from any page. We turn the SVG string into a data URL for a
plain <img> tag.

[6]
Regenerate the thumbnail when the document changes, debounced so we don't
re-export on every pointer move. Local edits can only affect the current
page, so each thumbnail skips changes made while another page is active. In a
multiplayer app you'd also listen to remote changes (source: 'all') and check
which page the changed shapes belong to.
-->
