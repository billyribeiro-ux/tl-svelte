<script lang="ts">
	import { fromComputed, getTranslation } from 'svelte-draw'
	import { getGlobalEditor } from '../../../../utils/globalEditor'
	import { params } from '../../../../utils/router.svelte'
	import { getMaybeApp } from '../../../hooks/useAppState.svelte'
	import { editorMessages as messages } from '../editor-messages'
	import { getEditorFileName } from '../useFileEditorOverrides.svelte'

	const msg = getTranslation()
	const app = getMaybeApp()
	const globalEditor = getGlobalEditor()
	const untitledProject = $derived(msg(messages.untitledProject))
	// The Svelte-side inputs are captured outside the computed: a computed does not track Svelte state.
	const title = $derived.by(() => {
		const fileSlug = params.fileSlug
		const editor = globalEditor.current
		const untitled = untitledProject
		return fromComputed('title', () =>
			getEditorFileName(app.current, fileSlug, editor, untitled)
		)
	})
</script>

<svelte:head>
	{#if title.current}
		<title>{app.current ? title.current : `${title.current} • svelte-draw`}</title>
	{/if}
</svelte:head>
