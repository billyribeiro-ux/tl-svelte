<script lang="ts">
	import type { Editor } from 'svelte-draw'
	import { CONTEXT_TYPE_DEFINITIONS, type ContextItem } from '../../shared/types/ContextItem'
	import PromptTag from './PromptTag.svelte'

	let {
		item,
		editor,
		onClick,
	}: {
		item: ContextItem
		editor: Editor
		onClick?: () => void
	} = $props()

	const definition = $derived(CONTEXT_TYPE_DEFINITIONS[item.type])
	const name = $derived(definition.name(item, editor))
	const icon = $derived(definition.icon)
</script>

<PromptTag text={name} {icon} {onClick} />
