<script lang="ts">
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import { createCommentingEnabled } from '../../hooks/useCommentingEnabled.svelte'
	import { createReadonly } from '../../hooks/useReadonly'
	import SvelteDrawUiMenuActionItem from '../primitives/menus/SvelteDrawUiMenuActionItem.svelte'
	import SvelteDrawUiMenuToolItem from '../primitives/menus/SvelteDrawUiMenuToolItem.svelte'

	const editor = getEditor()

	const isReadonlyMode = createReadonly()
	const commentingEnabled = createCommentingEnabled()

	const isInAcceptableReadonlyState = fromComputed('should display quick actions', () =>
		editor.isInAny('select', 'hand', 'zoom')
	)
	const isCommentToolSelected = fromComputed(
		'is comment tool selected',
		() => editor.getCurrentToolId() === 'comment'
	)
</script>

{#if !(isReadonlyMode.current && !isInAcceptableReadonlyState.current)}
	<!-- Undo / redo -->
	<SvelteDrawUiMenuActionItem actionId="undo" />
	<SvelteDrawUiMenuActionItem actionId="redo" />
	<!-- Delete / duplicate -->
	<SvelteDrawUiMenuActionItem actionId="delete" />
	<SvelteDrawUiMenuActionItem actionId="duplicate" />
	{#if commentingEnabled.current}
		<SvelteDrawUiMenuToolItem toolId="comment" isSelected={isCommentToolSelected.current} />
	{/if}
{/if}
