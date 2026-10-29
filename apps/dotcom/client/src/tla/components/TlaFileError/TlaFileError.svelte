<script lang="ts">
	import { TLRemoteSyncError, TLSyncErrorCloseEventReason } from '@svelte-draw/sync-core'
	import { F, getDialogs, SvelteDrawUiButton } from 'svelte-draw'
	import { getSetIsReady } from '../../hooks/useIsReady.svelte'
	import SubmitFeedbackDialog from '../dialogs/SubmitFeedbackDialog.svelte'
	import TlaSignInDialog from '../dialogs/TlaSignInDialog.svelte'
	import styles from './TlaFileError.module.css'
	import TlaFileErrorContent from './TlaFileErrorContent.svelte'

	let { error }: { error: unknown } = $props()

	const dialogs = getDialogs()
	const setIsReady = getSetIsReady()
	$effect(() => {
		setIsReady()
	})
</script>

{#snippet reportLink(chunks: string)}
	<SvelteDrawUiButton
		onclick={() => dialogs.addDialog({ component: SubmitFeedbackDialog })}
		type="primary"
		style="display: inline"
	>
		{chunks}
	</SvelteDrawUiButton>
{/snippet}

{#snippet defaultError()}
	<TlaFileErrorContent>
		{#snippet header()}<F defaultMessage="Something went wrong" />{/snippet}
		{#snippet para1()}<F defaultMessage="Please try refreshing the page." />{/snippet}
		{#snippet para2()}
			<F
				defaultMessage="Still having trouble? <a>Report a problem</a>"
				tags={{ a: reportLink }}
			/>
		{/snippet}
	</TlaFileErrorContent>
{/snippet}

{#if !(error instanceof TLRemoteSyncError)}
	{@render defaultError()}
{:else if error.reason === TLSyncErrorCloseEventReason.NOT_FOUND}
	<TlaFileErrorContent>
		{#snippet header()}<F defaultMessage="Not found" />{/snippet}
		{#snippet para1()}<F defaultMessage="The file you are looking for does not exist." />{/snippet}
	</TlaFileErrorContent>
{:else if error.reason === TLSyncErrorCloseEventReason.NOT_AUTHENTICATED}
	<TlaFileErrorContent>
		{#snippet header()}<F defaultMessage="Sign in" />{/snippet}
		{#snippet para1()}<F defaultMessage="You need to sign in to view this file." />{/snippet}
		{#snippet cta()}
			<button
				type="button"
				class={styles.link}
				data-testid="tla-sign-in-button"
				onclick={() => dialogs.addDialog({ component: TlaSignInDialog })}
			>
				<F defaultMessage="Sign in" />
			</button>
		{/snippet}
	</TlaFileErrorContent>
{:else if error.reason === TLSyncErrorCloseEventReason.FORBIDDEN}
	<TlaFileErrorContent>
		{#snippet header()}<F defaultMessage="Invite only" />{/snippet}
		{#snippet para1()}<F defaultMessage="Contact the owner to request access." />{/snippet}
	</TlaFileErrorContent>
{:else if error.reason === TLSyncErrorCloseEventReason.RATE_LIMITED}
	<TlaFileErrorContent>
		{#snippet header()}<F defaultMessage="Rate limited" />{/snippet}
		{#snippet para1()}<F defaultMessage="Too many requests. Please slow down." />{/snippet}
	</TlaFileErrorContent>
{:else if error.reason === TLSyncErrorCloseEventReason.ROOM_FULL}
	<TlaFileErrorContent>
		{#snippet header()}<F defaultMessage="Collaborator limit reached" />{/snippet}
		{#snippet para1()}
			<F defaultMessage="This file has reached the maximum number of active collaborators." />
		{/snippet}
	</TlaFileErrorContent>
{:else if error.reason === TLSyncErrorCloseEventReason.CLIENT_TOO_OLD}
	<TlaFileErrorContent>
		{#snippet header()}<F defaultMessage="Please reload" />{/snippet}
		{#snippet para1()}
			<F
				defaultMessage="A new version of svelte-draw is available. Please reload the page to continue."
			/>
		{/snippet}
	</TlaFileErrorContent>
{:else}
	{@render defaultError()}
{/if}
