<script lang="ts">
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import type { TLPageId } from '@svelte-draw/editor'
	import { getToasts, getUiEvents, type TLUiEventSource } from '../../context'
	import { createReadonly, createUnlockedSelectedShapesCount } from '../../hooks'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiMenuActionItem from '../primitives/menus/SvelteDrawUiMenuActionItem.svelte'
	import SvelteDrawUiMenuGroup from '../primitives/menus/SvelteDrawUiMenuGroup.svelte'
	import SvelteDrawUiMenuItem from '../primitives/menus/SvelteDrawUiMenuItem.svelte'
	import SvelteDrawUiMenuSubmenu from '../primitives/menus/SvelteDrawUiMenuSubmenu.svelte'
	import { messages } from './constants'

	const editor = getEditor()
	const msg = getTranslation()
	const pages = fromComputed('pages', () => editor.getPages())
	const currentPageId = fromComputed('current page id', () => editor.getCurrentPageId())
	const { addToast } = getToasts()
	const trackEvent = getUiEvents()
	const isReadonlyMode = createReadonly()
	const oneSelected = createUnlockedSelectedShapesCount(1)

	function moveToPage(pageId: TLPageId, source: TLUiEventSource) {
		// "Go back" returns to the page the shapes came from.
		const fromPageId = currentPageId.current
		editor.markHistoryStoppingPoint('move_shapes_to_page')
		editor.moveShapesToPage(editor.getSelectedShapeIds(), pageId)

		const toPage = editor.getPage(pageId)

		if (toPage) {
			addToast({
				title: msg(messages.movedToPageTitle),
				description: msg(messages.movedToPageDesc, { page: toPage.name }),
				actions: [
					{
						label: msg(messages.movedToPageAction),
						type: 'primary',
						onClick: () => {
							editor.markHistoryStoppingPoint('change-page')
							editor.setCurrentPage(fromPageId)
						},
					},
				],
			})
		}
		trackEvent('move-to-page', { source })
	}
</script>

{#if oneSelected.current && !isReadonlyMode.current}
	<SvelteDrawUiMenuSubmenu id="move-to-page" label={messages.contextMenuMoveToPage.id} size="small">
		<SvelteDrawUiMenuGroup id="pages">
			{#each pages.current as page (page.id)}
				<SvelteDrawUiMenuItem
					id={page.id}
					disabled={currentPageId.current === page.id}
					label={page.name.length > 30 ? `${page.name.slice(0, 30)}…` : page.name}
					onSelect={(source) => moveToPage(page.id, source)}
				/>
			{/each}
		</SvelteDrawUiMenuGroup>
		<SvelteDrawUiMenuGroup id="new-page">
			<SvelteDrawUiMenuActionItem actionId="move-to-new-page" />
		</SvelteDrawUiMenuGroup>
	</SvelteDrawUiMenuSubmenu>
{/if}
