<script lang="ts">
	import { getEditor, getSnapshot, loadSnapshot, SvelteDrawUiButton } from 'svelte-draw'

	const editor = getEditor()
	let showCheckMark = $state(false)

	const save = () => {
		// [1]
		const { document, session } = getSnapshot(editor.store)
		localStorage.setItem('snapshot', JSON.stringify({ document, session }))
		showCheckMark = true
	}

	const load = () => {
		const snapshot = localStorage.getItem('snapshot')
		if (!snapshot) return
		// [2]
		loadSnapshot(editor.store, JSON.parse(snapshot))
	}

	$effect(() => {
		if (!showCheckMark) return
		const timeout = setTimeout(() => (showCheckMark = false), 1000)
		return () => clearTimeout(timeout)
	})
</script>

<div class="tlui-menu snapshot-toolbar">
	<span class="snapshot-saved" data-visible={showCheckMark}>Saved</span>
	<SvelteDrawUiButton type="normal" onclick={save}>Save snapshot</SvelteDrawUiButton>
	<SvelteDrawUiButton type="normal" onclick={load}>Load snapshot</SvelteDrawUiButton>
</div>
