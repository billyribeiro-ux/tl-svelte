<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		moreOptions: { defaultMessage: 'Notification options' },
		filterAll: { defaultMessage: 'All' },
		filterUnread: { defaultMessage: 'Unread' },
		markAllRead: { defaultMessage: 'Mark all as read' },
	})

	export type NotificationFilter = 'all' | 'unread'
</script>

<script lang="ts">
	import {
		getTranslation,
		SvelteDrawUiButton,
		SvelteDrawUiDropdownMenuContent,
		SvelteDrawUiDropdownMenuRoot,
		SvelteDrawUiDropdownMenuTrigger,
		SvelteDrawUiMenuCheckboxItem,
		SvelteDrawUiMenuContextProvider,
		SvelteDrawUiMenuGroup,
		SvelteDrawUiMenuItem,
	} from 'svelte-draw'
	import { TLA_MENU_POSITION } from '../../tla-menu/tla-menu-position'
	import TlaIcon from '../../TlaIcon/TlaIcon.svelte'

	/** Uses the dotcom sidebar's menu primitives (not the canvas comment menus), so it renders without an editor. */
	let {
		filter,
		onFilterChange,
		onMarkAllRead,
		hasUnread,
	}: {
		filter: NotificationFilter
		onFilterChange(filter: NotificationFilter): void
		onMarkAllRead(): void
		hasUnread: boolean
	} = $props()

	const msg = getTranslation()
</script>

<SvelteDrawUiDropdownMenuRoot id="notifications-overflow">
	<SvelteDrawUiMenuContextProvider type="menu" sourceId="menu">
		<SvelteDrawUiDropdownMenuTrigger>
			{#snippet child({ props })}
				<SvelteDrawUiButton
					{...props}
					type="icon"
					title={msg(messages.moreOptions)}
					class="tlui-cmt-header-btn"
				>
					<TlaIcon icon="dots-vertical-strong" />
				</SvelteDrawUiButton>
			{/snippet}
		</SvelteDrawUiDropdownMenuTrigger>
		<SvelteDrawUiDropdownMenuContent side="bottom" align="end" {...TLA_MENU_POSITION}>
			<SvelteDrawUiMenuGroup id="notifications-filter">
				<SvelteDrawUiMenuCheckboxItem
					id="filter-all"
					label={msg(messages.filterAll)}
					checked={filter === 'all'}
					onSelect={() => onFilterChange('all')}
					readonlyOk
				/>
				<SvelteDrawUiMenuCheckboxItem
					id="filter-unread"
					label={msg(messages.filterUnread)}
					checked={filter === 'unread'}
					onSelect={() => onFilterChange('unread')}
					readonlyOk
				/>
			</SvelteDrawUiMenuGroup>
			<SvelteDrawUiMenuGroup id="notifications-actions">
				<SvelteDrawUiMenuItem
					id="mark-all-read"
					label={msg(messages.markAllRead)}
					onSelect={onMarkAllRead}
					disabled={!hasUnread}
					readonlyOk
				/>
			</SvelteDrawUiMenuGroup>
		</SvelteDrawUiDropdownMenuContent>
	</SvelteDrawUiMenuContextProvider>
</SvelteDrawUiDropdownMenuRoot>
