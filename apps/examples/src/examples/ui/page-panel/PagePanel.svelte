<script lang="ts">
	import { PageRecordType, fromComputed, getEditor, type TLPage } from 'svelte-draw'
	import PageThumbnail from './PageThumbnail.svelte'

	const editor = getEditor()

	// [3]
	const pages = fromComputed('pages', () => editor.getPages())
	const currentPageId = fromComputed('current page id', () => editor.getCurrentPageId())

	// [4]
	function handleCreatePage() {
		const newPageId = PageRecordType.createId()
		editor.run(() => {
			editor.markHistoryStoppingPoint('creating page')
			editor.createPage({ id: newPageId, name: `Page ${pages.current.length + 1}` })
			editor.setCurrentPage(newPageId)
		})
	}

	function handleRenamePage(page: TLPage) {
		const name = window.prompt('Rename page', page.name)
		if (name && name !== page.name) {
			editor.markHistoryStoppingPoint('renaming page')
			editor.renamePage(page.id, name)
		}
	}

	function handleDeletePage(page: TLPage) {
		editor.markHistoryStoppingPoint('deleting page')
		editor.deletePage(page.id)
	}
</script>

<div class="page-panel">
	<div class="page-panel-list">
		{#each pages.current as page, index (page.id)}
			<div
				class="page-panel-item"
				data-iscurrent={page.id === currentPageId.current}
				role="button"
				tabindex="0"
				onclick={() => editor.setCurrentPage(page.id)}
				onkeydown={(e) => {
					if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
						editor.setCurrentPage(page.id)
					}
				}}
				ondblclick={() => handleRenamePage(page)}
			>
				<PageThumbnail pageId={page.id} />
				<div class="page-panel-item-footer">
					<span class="page-panel-item-index">{index + 1}</span>
					<span class="page-panel-item-name">{page.name}</span>
					{#if pages.current.length > 1}
						<button
							class="page-panel-item-delete"
							title="Delete page"
							onclick={(e) => {
								e.stopPropagation()
								handleDeletePage(page)
							}}
						>
							×
						</button>
					{/if}
				</div>
			</div>
		{/each}
	</div>
	<button class="page-panel-add" onclick={handleCreatePage}> + New page </button>
</div>

<!--
[3]
`editor.getPages()` is a computed (reactive) value backed by a store query for
all page records, sorted by index. Reading it inside `fromComputed` means this
component updates automatically whenever pages are created, deleted,
renamed, or reordered.

[4]
Create the page with an explicit id so we can navigate to it right away.
`editor.run` batches the two changes, and `markHistoryStoppingPoint` makes the
whole thing a single undo step. Note that `editor.deletePage` automatically
switches to another page if you delete the current one.
-->
