<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const NOTIFICATIONS_MENU_ID = 'sidebar-notifications'

	const messages = defineMessages({
		notifications: { defaultMessage: 'Notifications' },
		// Both forms read the same in English, where "unread" doesn't inflect. Declared anyway, so a
		// translator gets the slots for languages where the adjective agrees with the count.
		unreadNotifications: {
			defaultMessage: '{count, plural, one {# unread} other {# unread}}',
		},
	})
</script>

<script lang="ts">
	import {
		createMenuIsOpen,
		getTranslation,
		SvelteDrawUiButton,
		SvelteDrawUiPopover,
		SvelteDrawUiPopoverContent,
		SvelteDrawUiPopoverTrigger,
	} from 'svelte-draw'
	import { TLA_MENU_POSITION } from '../../tla-menu/tla-menu-position'
	import TlaIcon from '../../TlaIcon/TlaIcon.svelte'
	import { getCommentNotifications } from './getCommentNotifications'
	import TlaSidebarNotificationsPanel from './TlaSidebarNotificationsPanel.svelte'
	import styles from '../sidebar.module.css'
	import notifications from './notifications.module.css'

	/** Opens the notifications popover (comments across the user's files), with an unread badge. */
	const msg = getTranslation()
	const notificationState = getCommentNotifications()
	const unreadCount = $derived(notificationState.current.unreadCount)
	// Same id (and the same editor scoping) as the popover, so we can dismiss it when a notification
	// is opened.
	const menu = createMenuIsOpen(NOTIFICATIONS_MENU_ID)
</script>

<SvelteDrawUiPopover id={NOTIFICATIONS_MENU_ID}>
	<SvelteDrawUiPopoverTrigger>
		{#snippet child({ props })}
			<SvelteDrawUiButton
				{...props}
				type="icon"
				class={styles.sidebarCreateFileButton}
				data-testid="tla-notifications-button"
				title={msg(messages.notifications)}
			>
				<TlaIcon icon="notification" />
				{#if unreadCount > 0}
					<span
						class={notifications.badge}
						aria-label={msg(messages.unreadNotifications, { count: unreadCount })}
					></span>
				{/if}
			</SvelteDrawUiButton>
		{/snippet}
	</SvelteDrawUiPopoverTrigger>
	<SvelteDrawUiPopoverContent
		side="bottom"
		align="start"
		{...TLA_MENU_POSITION}
		autoFocusFirstButton={false}
	>
		<TlaSidebarNotificationsPanel onClose={() => menu.onOpenChange(false)} />
	</SvelteDrawUiPopoverContent>
</SvelteDrawUiPopover>
