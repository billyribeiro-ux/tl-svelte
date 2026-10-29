<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	// Re-exported so the helpers keep their old home for the components that import them from here.
	export { getGetFileName, getRoomInfo } from './useRoomInfo.svelte'

	const ctaMessages = defineMessages({
		signInToShare: { defaultMessage: 'Sign in to share' },
	})

	const commentsMessages = defineMessages({
		comments: { defaultMessage: 'Comments' },
	})

	const signedOutShareMessages = defineMessages({
		share: { defaultMessage: 'Share' },
	})

	export type TopRightPanelContext = 'file' | 'published-file' | 'scratch' | 'legacy'
</script>

<script lang="ts">
	import { mergeProps } from 'bits-ui'
	import {
		commentsSidebarOpen,
		createCommentingEnabled,
		createCommentsSidebarOpen,
		toggleCommentsSidebar,
	} from '@svelte-draw/commenting'
	import {
		DefaultPeopleMenu,
		F,
		getDialogs,
		getEditor,
		getTranslation,
		SvelteDrawUiButton,
		usePassThroughWheelEvents,
	} from 'svelte-draw'
	import { routes } from '../../../routeDefs'
	import { navigate } from '../../../utils/router.svelte'
	import { getMaybeApp } from '../../hooks/useAppState.svelte'
	import { getCurrentFileId } from '../../hooks/useCurrentFileId.svelte'
	import { getIsCommentingEnabled } from '../../hooks/useIsCommentingEnabled.svelte'
	import { getSvelteDrawAppUiEvents } from '../../utils/app-ui-events'
	import TlaSignInDialog from '../dialogs/TlaSignInDialog.svelte'
	import TlaCtaButton from '../TlaCtaButton/TlaCtaButton.svelte'
	import TlaFileShareMenu from '../TlaFileShareMenu/TlaFileShareMenu.svelte'
	import TlaIcon from '../TlaIcon/TlaIcon.svelte'
	import styles from './top.module.css'
	import { getGetFileName, getRoomInfo } from './useRoomInfo.svelte'

	let { isAnonUser, context }: { isAnonUser: boolean; context: TopRightPanelContext } = $props()

	const msg = getTranslation()
	const passThroughWheelEvents = usePassThroughWheelEvents()
	const currentFileId = getCurrentFileId()
	const fileId = $derived(currentFileId.current)
	const trackEvent = getSvelteDrawAppUiEvents()
	const { addDialog } = getDialogs()
	const editor = getEditor()
	const app = getMaybeApp()

	// Share and the comments sidebar are mutually exclusive: opening share closes the sidebar.
	// (The reverse is automatic — clicking the sidebar button dismisses the share popover as an
	// outside interaction.)
	function closeSidebarOnShareOpen(isOpen: boolean) {
		if (isOpen) commentsSidebarOpen.set(editor, false)
	}

	const commentingEnabled = createCommentingEnabled()
	const commentingEnabledForUser = getIsCommentingEnabled()
	const commentsSidebarIsOpen = createCommentsSidebarOpen()
	const commentsLabel = $derived(msg(commentsMessages.comments))
	const shareLabel = $derived(msg(signedOutShareMessages.share))

	const name = getGetFileName()
	const roomInfo = getRoomInfo()

	async function handleLegacyImport() {
		const currentApp = app.current
		const room = roomInfo.current
		if (!currentApp || !room) return

		const { prefix, id } = room
		const res = await currentApp.createFile({ name: name.current, createSource: `${prefix}/${id}` })
		if (res.ok) {
			navigate(routes.tlaFile(res.value.fileId))
			trackEvent('create-file', { source: 'legacy-import-button' })
		}
	}
</script>

{#if isAnonUser}
	<div {@attach passThroughWheelEvents} class={styles.topRightPanel}>
		<DefaultPeopleMenu />
		<TlaFileShareMenu {fileId} {context} source="anon">
			{#snippet trigger({ props })}
				<SvelteDrawUiButton
					{...mergeProps(props, {
						onclick: () => trackEvent('open-share-menu', { source: 'anon-top-bar' }),
					})}
					type="icon"
					data-testid="tla-share-button"
					tooltip={shareLabel}
					title={shareLabel}
					class={styles.topRightAnonShareButton}
				>
					<TlaIcon icon="share" />
				</SvelteDrawUiButton>
			{/snippet}
		</TlaFileShareMenu>
		<TlaCtaButton
			canvas
			data-testid="tla-sign-in-button"
			onclick={() => {
				trackEvent('sign-up-clicked', {
					source: 'anon-landing-page',
					ctaMessage: msg(ctaMessages.signInToShare),
				})
				addDialog({ component: TlaSignInDialog })
			}}
		>
			<F {...ctaMessages.signInToShare} />
		</TlaCtaButton>
	</div>
{:else}
	<div {@attach passThroughWheelEvents} class={styles.topRightPanel}>
		<DefaultPeopleMenu />
		<!-- Only file editors mount the comments sidebar (see CommentsOnCanvas); in legacy and
		     published contexts the button would toggle state nothing reads. -->
		{#if context !== 'legacy' && context !== 'published-file'}
			<!--
				Toggles the comments sidebar (the thread list) open and closed. Lives next to Share as an
				opt-in entry point, decoupled from the comment tool: the tool places comments on the canvas,
				this button reveals the list. Hidden entirely when commenting isn't licensed for this
				editor, or when the viewer is signed out.
			-->
			{#if commentingEnabled.current && commentingEnabledForUser.current}
				<SvelteDrawUiButton
					type="icon"
					class={styles.commentsSidebarButton}
					data-testid="tla-comments-button"
					aria-pressed={commentsSidebarIsOpen.current}
					tooltip={commentsLabel}
					title={commentsLabel}
					onclick={() => {
						toggleCommentsSidebar(editor)
						trackEvent('toggle-comments-sidebar', {
							source: 'comments',
							open: !commentsSidebarIsOpen.current,
						})
					}}
				>
					<TlaIcon icon="comment" />
				</SvelteDrawUiButton>
			{/if}
		{/if}
		{#if context === 'legacy'}
			<TlaCtaButton canvas data-testid="tla-import-button" onclick={handleLegacyImport}>
				<F defaultMessage="Copy to my workspace" />
			</TlaCtaButton>
		{/if}
		{#if context !== 'legacy'}
			<TlaFileShareMenu
				fileId={fileId!}
				source="file-header"
				{context}
				onOpenChange={closeSidebarOnShareOpen}
			>
				{#snippet trigger({ props })}
					<TlaCtaButton
						{...mergeProps(props, {
							onclick: () => trackEvent('open-share-menu', { source: 'top-bar' }),
						})}
						canvas
						data-testid="tla-share-button"
					>
						<F defaultMessage="Share" />
					</TlaCtaButton>
				{/snippet}
			</TlaFileShareMenu>
		{/if}
	</div>
{/if}
