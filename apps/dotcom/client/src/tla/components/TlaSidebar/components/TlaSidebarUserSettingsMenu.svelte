<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		userMenu: { defaultMessage: 'User settings' },
	})

	const USER_SETTINGS_MENU_ID = 'user-settings-sidebar'
</script>

<script lang="ts">
	import {
		createMenuIsOpen,
		F,
		fromComputed,
		getTranslation,
		LanguageMenu,
		preventDefault,
		SvelteDrawUiButton,
		SvelteDrawUiDropdownMenuContent,
		SvelteDrawUiDropdownMenuRoot,
		SvelteDrawUiDropdownMenuTrigger,
		SvelteDrawUiMenuContextProvider,
		SvelteDrawUiMenuGroup,
	} from 'svelte-draw'
	import { getApp } from '../../../hooks/useAppState.svelte'
	import CookieConsentMenuItem from '../../menu-items/CookieConsentMenuItem.svelte'
	import DebugMenuGroup from '../../menu-items/DebugMenuGroup.svelte'
	import LegalSummaryMenuItem from '../../menu-items/LegalSummaryMenuItem.svelte'
	import SignOutMenuItem from '../../menu-items/SignOutMenuItem.svelte'
	import ThemeSubmenu from '../../menu-items/ThemeSubmenu.svelte'
	import UserManualMenuItem from '../../menu-items/UserManualMenuItem.svelte'
	import { TLA_MENU_POSITION } from '../../tla-menu/tla-menu-position'
	import TlaIcon from '../../TlaIcon/TlaIcon.svelte'
	import styles from '../sidebar.module.css'

	const msg = getTranslation()
	const app = getApp()
	const userMenuLbl = $derived(msg(messages.userMenu))
	const userState = fromComputed('auth', () => app.current.getUser())
	const user = $derived(userState.current)

	// The dropdown's open state is keyed globally by its id, so we can reuse the
	// same hook to open the menu when the user right-clicks the row.
	const menu = createMenuIsOpen(USER_SETTINGS_MENU_ID)
</script>

<SvelteDrawUiDropdownMenuRoot id={USER_SETTINGS_MENU_ID}>
	<SvelteDrawUiMenuContextProvider type="menu" sourceId="dialog">
		<SvelteDrawUiDropdownMenuTrigger>
			{#snippet child({ props })}
				<SvelteDrawUiButton
					{...props}
					type="menu"
					tooltip={userMenuLbl}
					title={userMenuLbl}
					class={[styles.sidebarUserSettingsTrigger, styles.hoverable].join(' ')}
					data-testid="tla-sidebar-user-settings-trigger"
					oncontextmenu={(e: MouseEvent) => {
						preventDefault(e)
						menu.onOpenChange(true)
					}}
				>
					<TlaIcon icon="avatar" class={styles.sidebarUserSettingsAvatarIcon} />
					<div class={[styles.sidebarUserSettingsName, 'tla-text_ui__regular', 'notranslate']}>
						{#if user?.name}{user.name}{:else}<F defaultMessage="Account" />{/if}
					</div>
					<div class={styles.sidebarUserSettingsIcon}>
						<TlaIcon icon="help-circle" />
					</div>
				</SvelteDrawUiButton>
			{/snippet}
		</SvelteDrawUiDropdownMenuTrigger>
		<!-- Hang ~8px over the sidebar's right edge (see TlaFileMenu) rather than inset. -->
		<SvelteDrawUiDropdownMenuContent
			side="bottom"
			align="end"
			{...TLA_MENU_POSITION}
			alignOffset={-18}
		>
			{#if user}
				<SvelteDrawUiMenuGroup id="preferences">
					<ThemeSubmenu />
					<LanguageMenu />
				</SvelteDrawUiMenuGroup>
				<DebugMenuGroup />
			{/if}
			<SvelteDrawUiMenuGroup id="legal">
				<UserManualMenuItem icon={false} />
				<LegalSummaryMenuItem />
				<CookieConsentMenuItem />
			</SvelteDrawUiMenuGroup>
			{#if user}
				<SvelteDrawUiMenuGroup id="signout">
					<SignOutMenuItem />
				</SvelteDrawUiMenuGroup>
			{/if}
		</SvelteDrawUiDropdownMenuContent>
	</SvelteDrawUiMenuContextProvider>
</SvelteDrawUiDropdownMenuRoot>
