<script lang="ts">
	import type { Editor } from '@svelte-draw/editor'
	import type { Snippet } from 'svelte'
	import { setIdScope } from '../canvas/safeId'
	import { setEditor } from '../context/editor'

	let { editor, children }: { editor: Editor; children: Snippet } = $props()

	// The editor is fixed for the lifetime of this component; key it on the editor to swap editors.
	// svelte-ignore state_referenced_locally
	setEditor(editor)
	setIdScope()
</script>

{@render children()}
