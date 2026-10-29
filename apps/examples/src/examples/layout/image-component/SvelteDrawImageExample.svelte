<script lang="ts">
	import {
		Box,
		type Editor,
		getSnapshot,
		type StoreSnapshot,
		SvelteDraw,
		SvelteDrawImage,
		type TLPageId,
		type TLRecord,
		type TLStoreSnapshot,
	} from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import initialSnapshot from './snapshot.json'

	// There's a guide at the bottom of this file!

	let editor = $state.raw<Editor | undefined>()
	let snapshot = $state.raw<StoreSnapshot<TLRecord>>(initialSnapshot as TLStoreSnapshot)
	let currentPageId = $state<TLPageId | undefined>()
	let showBackground = $state(true)
	let isDarkMode = $state(false)
	let viewportPageBounds = $state.raw(new Box(0, 0, 600, 400))
	let isEditing = $state(false)
	let format = $state<'svg' | 'png'>('svg')
</script>

<div style="padding: 30px;">
	<div>
		<button
			style="cursor: pointer; margin-right: 8px;"
			onclick={() => {
				if (isEditing) {
					if (!editor) return
					isDarkMode = editor.user.getIsDarkMode()
					showBackground = editor.getInstanceState().exportBackground
					viewportPageBounds = editor.getViewportPageBounds()
					currentPageId = editor.getCurrentPageId()
					snapshot = getSnapshot(editor.store).document
					isEditing = false
				} else {
					isEditing = true
				}
			}}
		>
			{isEditing ? '✓ Save drawing' : '✎ Edit drawing'}
		</button>
		{#if !isEditing}
			<label for="format" style="margin-right: 8px;">Format</label>
			<select name="format" id="format" bind:value={format}>
				<option value="svg">SVG</option>
				<option value="png">PNG</option>
			</select>
		{/if}
	</div>
	<div style="width: 600px; height: 400px; margin-top: 15px;">
		{#if isEditing}
			<SvelteDraw
				{snapshot}
				onMount={(e: Editor) => {
					editor = e
					e.user.updateUserPreferences({ colorScheme: isDarkMode ? 'dark' : 'light' })
					if (currentPageId) {
						e.setCurrentPage(currentPageId)
					}
					if (viewportPageBounds) {
						e.zoomToBounds(viewportPageBounds, { inset: 0 })
					}
				}}
			/>
		{:else}
			<!-- [1] [2] [3] -->
			<SvelteDrawImage
				{snapshot}
				pageId={currentPageId}
				background={showBackground}
				darkMode={isDarkMode}
				bounds={viewportPageBounds}
				padding={0}
				scale={1}
				{format}
			/>
		{/if}
	</div>
</div>

<!--
[1]
Pass a `TLStoreSnapshot` to the `snapshot` prop. When the user saves, we grab a fresh
one from the editor with `getSnapshot(editor.store).document`.

[2]
`pageId` picks which page to render. It defaults to the first page, which is why we
capture the editor's current page when leaving edit mode.

[3]
The remaining props control appearance: `background` and `darkMode` match what the
user was looking at, `bounds` renders just the region that was in the viewport, and
`format` chooses between SVG and PNG output.
-->
