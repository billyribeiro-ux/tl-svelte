<script lang="ts">
	import { fromComputed, getTranslation } from 'svelte-draw'
	import { getGlobalEditor } from '../../../../utils/globalEditor'
	import { editorMessages as messages } from '../editor-messages'

	const msg = getTranslation()
	const globalEditor = getGlobalEditor()
	const untitledProject = $derived(msg(messages.untitledProject))
	// The editor and the fallback are captured outside the computed: a computed does not track Svelte state.
	const title = $derived.by(() => {
		const editor = globalEditor.current
		const untitled = untitledProject
		return fromComputed('title', () => editor?.getDocumentSettings().name || untitled)
	})
</script>

<svelte:head>
	<title>{title.current} • svelte-draw</title>
</svelte:head>
