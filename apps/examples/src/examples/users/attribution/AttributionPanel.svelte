<script lang="ts">
	import {
		fromComputed,
		fromSignal,
		getEditor,
		type Editor,
		type TLNoteShape,
		type TLShape,
	} from 'svelte-draw'

	const editor = getEditor()

	// [5]
	function attributionSummary(editor: Editor, shape: TLShape) {
		const createdBy = typeof shape.meta.createdBy === 'string' ? shape.meta.createdBy : null
		const createdByUser = createdBy
			? (editor.store.props.users.resolve?.(createdBy).get() ?? null)
			: null

		const noteProps = shape.type === 'note' ? (shape as TLNoteShape).props : null
		const textLastEditedBy = noteProps?.textLastEditedBy ?? null
		const textLastEditedByUser = textLastEditedBy
			? (editor.store.props.users.resolve?.(textLastEditedBy).get() ?? null)
			: null

		return {
			type: shape.type,
			createdByName: createdByUser?.name ?? null,
			createdByColor: createdByUser?.color,
			textLastEditedByName: textLastEditedByUser?.name ?? null,
			textLastEditedByColor: textLastEditedByUser?.color,
		}
	}

	// [4]
	const info = fromComputed('attribution-info', () => {
		const selected = editor.getOnlySelectedShape()
		if (!selected) return null
		return attributionSummary(editor, selected)
	})

	const currentUser = fromSignal(editor.store.props.users.currentUser)
</script>

<div class="attribution-panel">
	<div class="attribution-section">
		<div class="attribution-section-title">Current user</div>
		<div class="attribution-row">
			<span class="attribution-label">Name</span>
			<span style:color={currentUser.current?.color}>{currentUser.current?.name || '—'}</span>
		</div>
		<div class="attribution-row">
			<span class="attribution-label">ID</span>
			<span class="attribution-value">{currentUser.current?.id ?? '(anonymous)'}</span>
		</div>
	</div>
	{#if info.current}
		{@const selected = info.current}
		<div class="attribution-section">
			<div class="attribution-section-title">Selected shape</div>
			<div class="attribution-row">
				<span class="attribution-label">Type</span>
				<span>{selected.type}</span>
			</div>
			{#if selected.createdByName}
				<div class="attribution-row">
					<span class="attribution-label">Created by</span>
					<span style:color={selected.createdByColor}>{selected.createdByName}</span>
				</div>
			{/if}
			{#if selected.textLastEditedByName}
				<div class="attribution-row">
					<span class="attribution-label">Text last edited by</span>
					<span style:color={selected.textLastEditedByColor}>{selected.textLastEditedByName}</span>
				</div>
			{/if}
		</div>
	{:else}
		<div class="attribution-hint">Select a shape to see its attribution</div>
	{/if}
</div>
