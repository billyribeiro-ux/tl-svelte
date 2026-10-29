<script lang="ts">
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import SvelteDrawUiMenuActionItem from '../primitives/menus/SvelteDrawUiMenuActionItem.svelte'

	const editor = getEditor()
	const isPenMode = fromComputed('is pen mode', () => editor.getInstanceState().isPenMode)
</script>

{#if isPenMode.current}
	<SvelteDrawUiMenuActionItem actionId="exit-pen-mode" />
{/if}
