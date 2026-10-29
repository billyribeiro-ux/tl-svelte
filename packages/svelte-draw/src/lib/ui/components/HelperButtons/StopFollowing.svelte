<script lang="ts">
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import { getActions } from '../../context/actions.svelte'
	import SvelteDrawUiMenuItem, {
		type TLUiMenuItemProps,
	} from '../primitives/menus/SvelteDrawUiMenuItem.svelte'

	const editor = getEditor()
	const actions = getActions()

	const followingUser = fromComputed(
		'is following user',
		() => !!editor.getInstanceState().followingUserId
	)
</script>

{#if followingUser.current}
	<SvelteDrawUiMenuItem {...actions['stop-following'] as TLUiMenuItemProps} />
{/if}
