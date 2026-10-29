<script lang="ts">
	import { getEditor } from '@svelte-draw/svelte'
	import {
		type RecordsDiff,
		type TLEditorSnapshot,
		type TLEventMapHandler,
		type TLRecord,
		SvelteDrawUiButton,
		squashRecordDiffs,
	} from 'svelte-draw'

	const editor = getEditor()
	let hasUnsavedChanges = $state(false)

	// [1]
	let unsavedChanges: RecordsDiff<TLRecord> = emptyDiff()

	function emptyDiff(): RecordsDiff<TLRecord> {
		return { added: {}, removed: {}, updated: {} }
	}

	function isDiffEmpty(diff: RecordsDiff<TLRecord>) {
		for (const key in diff.added) return false
		for (const key in diff.removed) return false
		for (const key in diff.updated) return false
		return true
	}

	function saveChanges(_diff: RecordsDiff<TLRecord>, _snapshot: TLEditorSnapshot) {
		// Send the diff or the snapshot to your server here.
	}

	$effect(() => {
		const handleDocumentChange: TLEventMapHandler<'change'> = (entry) => {
			squashRecordDiffs([unsavedChanges, entry.changes], { mutateFirstDiff: true })
			hasUnsavedChanges = !isDiffEmpty(unsavedChanges)
		}

		// [2]
		return editor.store.listen(handleDocumentChange, { scope: 'document' })
	})

	// [3]
	function handleSave() {
		saveChanges(unsavedChanges, editor.getSnapshot())
		unsavedChanges = emptyDiff()
		hasUnsavedChanges = false
	}
</script>

<div class="tlui-menu">
	<SvelteDrawUiButton type="normal" onclick={handleSave} disabled={!hasUnsavedChanges}>
		{hasUnsavedChanges ? 'Save changes' : 'No changes'}
	</SvelteDrawUiButton>
</div>
