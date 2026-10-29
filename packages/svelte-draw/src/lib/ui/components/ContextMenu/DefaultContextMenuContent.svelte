<script lang="ts">
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import { getShowCollaborationUi } from '../../hooks/useCollaborationStatus'
	import { createCommentingEnabled } from '../../hooks/useCommentingEnabled.svelte'
	import ArrangeMenuSubmenu from '../menu-items/ArrangeMenuSubmenu.svelte'
	import ClipboardMenuGroup from '../menu-items/ClipboardMenuGroup.svelte'
	import ConversionsMenuGroup from '../menu-items/ConversionsMenuGroup.svelte'
	import CursorChatItem from '../menu-items/CursorChatItem.svelte'
	import EditMenuSubmenu from '../menu-items/EditMenuSubmenu.svelte'
	import MoveToPageMenu from '../menu-items/MoveToPageMenu.svelte'
	import ReorderMenuSubmenu from '../menu-items/ReorderMenuSubmenu.svelte'
	import SelectAllMenuItem from '../menu-items/SelectAllMenuItem.svelte'
	import SvelteDrawUiMenuGroup from '../primitives/menus/SvelteDrawUiMenuGroup.svelte'
	import CommentMenuItem from './CommentMenuItem.svelte'

	const editor = getEditor()
	const showCollaborationUi = getShowCollaborationUi()
	const commentingEnabled = createCommentingEnabled()

	const isSinglePageMode = fromComputed('isSinglePageMode', () => editor.options.maxPages <= 1)
</script>

<!--
	Note: we intentionally don't bail out for non-select tools. Each submenu
	below self-hides when it has nothing to offer (no selection, no shapes,
	readonly), so the menu carries the right items in any tool — e.g. Paste
	and Select all after a touch long-press while a shape tool is active.
	(Closes #8828.)
-->
{#if showCollaborationUi || commentingEnabled.current}
	<SvelteDrawUiMenuGroup id="cursor-chat">
		{#if commentingEnabled.current}
			<CommentMenuItem />
		{/if}
		{#if showCollaborationUi}
			<CursorChatItem />
		{/if}
	</SvelteDrawUiMenuGroup>
{/if}
<SvelteDrawUiMenuGroup id="modify">
	<EditMenuSubmenu />
	<ArrangeMenuSubmenu />
	<ReorderMenuSubmenu />
	{#if !isSinglePageMode.current}
		<MoveToPageMenu />
	{/if}
</SvelteDrawUiMenuGroup>
<ClipboardMenuGroup />
<ConversionsMenuGroup />
<SvelteDrawUiMenuGroup id="select-all">
	<SelectAllMenuItem />
</SvelteDrawUiMenuGroup>
