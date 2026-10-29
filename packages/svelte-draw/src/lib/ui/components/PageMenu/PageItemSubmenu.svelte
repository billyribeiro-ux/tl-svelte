<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	const messages = defineMessages({
		pageMenuSubmenuDelete: { id: 'page-menu.submenu.delete', defaultMessage: 'Delete' },
		pageMenuSubmenuDuplicatePage: {
			id: 'page-menu.submenu.duplicate-page',
			defaultMessage: 'Duplicate',
		},
		pageMenuSubmenuMoveDown: { id: 'page-menu.submenu.move-down', defaultMessage: 'Move down' },
		pageMenuSubmenuMoveUp: { id: 'page-menu.submenu.move-up', defaultMessage: 'Move up' },
		pageMenuSubmenuRename: { id: 'page-menu.submenu.rename', defaultMessage: 'Rename' },
		pageMenuSubmenuTitle: { id: 'page-menu.submenu.title', defaultMessage: 'Menu' },
	})

	/** @public */
	export interface PageItemSubmenuProps {
		index: number
		item: { id: string; name: string }
		listSize: number
		onRename?(): void
	}
</script>

<script lang="ts">
	import { PageRecordType, type TLPageId } from '@svelte-draw/editor'
	import { getEditor } from '@svelte-draw/svelte'
	import { getUiEvents } from '../../context/events'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiButton from '../primitives/Button/SvelteDrawUiButton.svelte'
	import SvelteDrawUiButtonIcon from '../primitives/Button/SvelteDrawUiButtonIcon.svelte'
	import SvelteDrawUiMenuContextProvider from '../primitives/menus/SvelteDrawUiMenuContextProvider.svelte'
	import SvelteDrawUiMenuGroup from '../primitives/menus/SvelteDrawUiMenuGroup.svelte'
	import SvelteDrawUiMenuItem from '../primitives/menus/SvelteDrawUiMenuItem.svelte'
	import SvelteDrawUiDropdownMenuContent from '../primitives/SvelteDrawUiDropdownMenuContent.svelte'
	import SvelteDrawUiDropdownMenuRoot from '../primitives/SvelteDrawUiDropdownMenuRoot.svelte'
	import SvelteDrawUiDropdownMenuTrigger from '../primitives/SvelteDrawUiDropdownMenuTrigger.svelte'
	import { onMovePage } from './edit-pages-shared'

	let { index, listSize, item, onRename }: PageItemSubmenuProps = $props()

	const editor = getEditor()
	const msg = getTranslation()
	const trackEvent = getUiEvents()

	function onDuplicate() {
		editor.markHistoryStoppingPoint('creating page')
		const newId = PageRecordType.createId()
		editor.duplicatePage(item.id as TLPageId, newId)
		trackEvent('duplicate-page', { source: 'page-menu' })
	}

	function onMoveUp() {
		onMovePage(editor, item.id as TLPageId, index, index - 1, trackEvent)
	}

	function onMoveDown() {
		onMovePage(editor, item.id as TLPageId, index, index + 1, trackEvent)
	}

	function onDelete() {
		editor.markHistoryStoppingPoint('deleting page')
		editor.deletePage(item.id as TLPageId)
		trackEvent('delete-page', { source: 'page-menu' })
	}
</script>

<SvelteDrawUiDropdownMenuRoot id={`page item submenu ${index}`}>
	<SvelteDrawUiDropdownMenuTrigger>
		{#snippet child({ props })}
			<SvelteDrawUiButton
				{...props}
				type="icon"
				tooltip={msg(messages.pageMenuSubmenuTitle)}
				title={msg(messages.pageMenuSubmenuTitle)}
				data-testid="page-menu.item-submenu"
			>
				<SvelteDrawUiButtonIcon icon="dots-vertical" small />
			</SvelteDrawUiButton>
		{/snippet}
	</SvelteDrawUiDropdownMenuTrigger>
	<SvelteDrawUiDropdownMenuContent side="bottom" align="start" alignOffset={0} sideOffset={0}>
		<SvelteDrawUiMenuContextProvider type="menu" sourceId="page-menu">
			<SvelteDrawUiMenuGroup id="modify">
				{#if onRename}
					<SvelteDrawUiMenuItem
						id="rename"
						label={messages.pageMenuSubmenuRename.id}
						onSelect={onRename}
					/>
				{/if}
				<SvelteDrawUiMenuItem
					id="duplicate"
					label={messages.pageMenuSubmenuDuplicatePage.id}
					onSelect={onDuplicate}
					disabled={listSize >= editor.options.maxPages}
				/>
				{#if index > 0}
					<SvelteDrawUiMenuItem
						id="move-up"
						onSelect={onMoveUp}
						label={messages.pageMenuSubmenuMoveUp.id}
					/>
				{/if}
				{#if index < listSize - 1}
					<SvelteDrawUiMenuItem
						id="move-down"
						label={messages.pageMenuSubmenuMoveDown.id}
						onSelect={onMoveDown}
					/>
				{/if}
			</SvelteDrawUiMenuGroup>
			{#if listSize > 1}
				<SvelteDrawUiMenuGroup id="delete">
					<SvelteDrawUiMenuItem
						id="delete"
						onSelect={onDelete}
						label={messages.pageMenuSubmenuDelete.id}
					/>
				</SvelteDrawUiMenuGroup>
			{/if}
		</SvelteDrawUiMenuContextProvider>
	</SvelteDrawUiDropdownMenuContent>
</SvelteDrawUiDropdownMenuRoot>
