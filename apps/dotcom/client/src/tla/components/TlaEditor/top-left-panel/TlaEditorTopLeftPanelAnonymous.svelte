<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		pageMenu: { defaultMessage: 'Page menu' },
	})
</script>

<script lang="ts">
	import {
		DefaultPageMenu,
		EditSubmenu,
		ExportFileContentSubMenu,
		ExtrasGroup,
		fromComputed,
		getEditor,
		getTranslation,
		SvelteDrawUiButton,
		SvelteDrawUiDropdownMenuContent,
		SvelteDrawUiDropdownMenuRoot,
		SvelteDrawUiDropdownMenuTrigger,
		SvelteDrawUiMenuActionItem,
		SvelteDrawUiMenuContextProvider,
		SvelteDrawUiMenuGroup,
	} from 'svelte-draw'
	import { getMaybeApp } from '../../../hooks/useAppState.svelte'
	import CookieConsentMenuItem from '../../menu-items/CookieConsentMenuItem.svelte'
	import GiveUsFeedbackMenuItem from '../../menu-items/GiveUsFeedbackMenuItem.svelte'
	import LegalSummaryMenuItem from '../../menu-items/LegalSummaryMenuItem.svelte'
	import UserManualMenuItem from '../../menu-items/UserManualMenuItem.svelte'
	import ExternalLink from '../../ExternalLink/ExternalLink.svelte'
	import TlaIcon from '../../TlaIcon/TlaIcon.svelte'
	import TlaLogo from '../../TlaLogo/TlaLogo.svelte'
	import styles from '../top.module.css'
	import { getRoomInfo } from '../useRoomInfo.svelte'
	import SignInMenuItem from './SignInMenuItem.svelte'
	import TlaPreferencesGroup from './TlaPreferencesGroup.svelte'
	import TlaViewSubmenu from './TlaViewSubmenu.svelte'

	const SEPARATOR = '/'

	const msg = getTranslation()
	const pageMenuLbl = $derived(msg(messages.pageMenu))
	// GOTCHA: 'anonymous' doesn't always mean logged out
	// we show this version of the panel for published files as well.
	const app = getMaybeApp()

	const roomInfo = getRoomInfo()

	const canCopyToApp = $derived(app.current && roomInfo.current?.prefix)

	const editor = getEditor()
	const anonFileName = fromComputed(
		'fileName',
		() => editor.getDocumentSettings().name || undefined
	)

	const hasPages = fromComputed('hasPages', () => editor.getPages().length > 1)

	// This is used in three places
	// - root, ie svelte-draw.invalid
	// - being an anonymous guest on someone else's file
	// - being a logged out viewer of a published file
</script>

<ExternalLink
	href="https://svelte-draw.invalid?utm_source=dotcom&utm_medium=organic&utm_campaign=top-left-logo"
	eventName="top-left-logo-clicked"
	aria-label="svelte-draw.invalid"
	class={styles.topLeftOfflineLogo}
>
	<TlaLogo data-testid="tla-top-left-logo-icon" />
</ExternalLink>
{#if anonFileName.current}
	<!-- margin-right: 0 undoes the nth-last-of-type rule in top.module.css -->
	<span class={styles.topLeftPanelSeparator} style="margin-right: 0">{SEPARATOR}</span>
	<div class={styles.topLeftInputWrapper}>
		<button class={styles.topLeftInputNameWidthSetter} data-testid="tla-file-name">
			{anonFileName.current.replace(/ /g, '\u00a0')}
		</button>
	</div>
{/if}
{#if hasPages.current}
	<span class={styles.topLeftPanelSeparator}>{SEPARATOR}</span>
	<DefaultPageMenu />
{/if}
<SvelteDrawUiDropdownMenuRoot id="file-menu-anon">
	<SvelteDrawUiMenuContextProvider type="menu" sourceId="dialog">
		<SvelteDrawUiDropdownMenuTrigger>
			{#snippet child({ props })}
				<SvelteDrawUiButton
					{...props}
					type="icon"
					class={styles.topLeftMainMenuTrigger}
					tooltip={pageMenuLbl}
					title={pageMenuLbl}
					data-testid="tla-main-menu"
				>
					<TlaIcon icon="dots-vertical-strong" />
				</SvelteDrawUiButton>
			{/snippet}
		</SvelteDrawUiDropdownMenuTrigger>
		<SvelteDrawUiDropdownMenuContent side="bottom" align="start" alignOffset={0} sideOffset={0}>
			<SvelteDrawUiMenuGroup id="basic">
				<EditSubmenu />
				<TlaViewSubmenu />
				<ExportFileContentSubMenu />
				<ExtrasGroup />
				<SvelteDrawUiMenuActionItem actionId="save-file-copy" />
				{#if canCopyToApp}
					<SvelteDrawUiMenuActionItem actionId="copy-to-my-files" />
				{/if}
			</SvelteDrawUiMenuGroup>
			<TlaPreferencesGroup />
			<SvelteDrawUiMenuGroup id="misc">
				<UserManualMenuItem />
				<GiveUsFeedbackMenuItem />
				<LegalSummaryMenuItem />
				<CookieConsentMenuItem />
			</SvelteDrawUiMenuGroup>
			{#if !app.current}
				<SvelteDrawUiMenuGroup id="signin">
					<SignInMenuItem />
				</SvelteDrawUiMenuGroup>
			{/if}
		</SvelteDrawUiDropdownMenuContent>
	</SvelteDrawUiMenuContextProvider>
</SvelteDrawUiDropdownMenuRoot>
