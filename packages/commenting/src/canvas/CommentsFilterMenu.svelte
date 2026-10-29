<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		commentsFilter: { id: 'comments.filter', defaultMessage: 'Filter comments' },
		commentsOnlyMyComments: { id: 'comments.only-my-comments', defaultMessage: 'Only my comments' },
		commentsOnlyUnread: { id: 'comments.only-unread', defaultMessage: 'Only unread' },
		commentsShowAllPages: { id: 'comments.show-all-pages', defaultMessage: 'Show all pages' },
		commentsShowResolved: {
			id: 'comments.show-resolved',
			defaultMessage: 'Show resolved comments',
		},
	})
</script>

<script lang="ts">
	import {
		fromComputed,
		getEditor,
		getTranslation,
		SvelteDrawUiButton,
		SvelteDrawUiDropdownMenuContent,
		SvelteDrawUiDropdownMenuRoot,
		SvelteDrawUiDropdownMenuTrigger,
		SvelteDrawUiMenuCheckboxItem,
		SvelteDrawUiMenuContextProvider,
		SvelteDrawUiMenuGroup,
	} from 'svelte-draw'
	import MoreMenuIcon from '../ui/icons/MoreMenuIcon.svelte'
	import type { CommentsFilterMenuProps } from './comments-filter-menu'
	import type { SidebarFilters } from './sidebar-filters'
	import { sidebarFilters } from './state'

	/** The funnel dropdown in the sidebar header: toggles for which threads the list shows.
	 * @public */
	let { canFilterByAuthor, canFilterByUnread }: CommentsFilterMenuProps = $props()

	const editor = getEditor()
	const msg = getTranslation()
	const filters = fromComputed('sidebar filters', () => sidebarFilters.get(editor))
	const toggle = (key: keyof SidebarFilters) => {
		sidebarFilters.update(editor, (f) => ({ ...f, [key]: !f[key] }))
	}
</script>

<SvelteDrawUiDropdownMenuRoot id="comments-filter">
	<SvelteDrawUiDropdownMenuTrigger>
		{#snippet child({ props })}
			<SvelteDrawUiButton
				{...props}
				type="icon"
				tooltip={msg(messages.commentsFilter)}
				title={msg(messages.commentsFilter)}
				class="tlui-cmt-header-btn"
			>
				<MoreMenuIcon />
			</SvelteDrawUiButton>
		{/snippet}
	</SvelteDrawUiDropdownMenuTrigger>
	<!-- No tlui-cmt-menu here: the rows are svelte-draw menu items, which carry their own insets —
	     the extra padding would set this menu apart from the canvas menus it should match. -->
	<SvelteDrawUiDropdownMenuContent side="bottom" align="end" alignOffset={0}>
		<SvelteDrawUiMenuContextProvider type="menu" sourceId="menu">
			<SvelteDrawUiMenuGroup id="comments-filter">
				<SvelteDrawUiMenuCheckboxItem
					id="show-all-pages"
					label={messages.commentsShowAllPages.id}
					checked={!filters.current.onlyCurrentPage}
					onSelect={() => toggle('onlyCurrentPage')}
				/>
				{#if canFilterByAuthor}
					<SvelteDrawUiMenuCheckboxItem
						id="only-my-comments"
						label={messages.commentsOnlyMyComments.id}
						checked={filters.current.onlyMine}
						onSelect={() => toggle('onlyMine')}
					/>
				{/if}
				{#if canFilterByUnread}
					<SvelteDrawUiMenuCheckboxItem
						id="only-unread"
						label={messages.commentsOnlyUnread.id}
						checked={filters.current.onlyUnread}
						onSelect={() => toggle('onlyUnread')}
					/>
				{/if}
				<SvelteDrawUiMenuCheckboxItem
					id="show-resolved"
					label={messages.commentsShowResolved.id}
					checked={filters.current.showResolved}
					onSelect={() => toggle('showResolved')}
				/>
			</SvelteDrawUiMenuGroup>
		</SvelteDrawUiMenuContextProvider>
	</SvelteDrawUiDropdownMenuContent>
</SvelteDrawUiDropdownMenuRoot>
