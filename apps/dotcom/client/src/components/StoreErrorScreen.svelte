<script lang="ts">
	import { TLRemoteSyncError, TLSyncErrorCloseEventReason } from '@svelte-draw/sync-core'
	import ErrorPage from './ErrorPage/ErrorPage.svelte'
	import LoginRedirectPage from './LoginRedirectPage/LoginRedirectPage.svelte'

	let { error }: { error: Error } = $props()

	const view = $derived.by(() => {
		let header = 'Could not connect to server.'
		let message = ''

		if (error instanceof TLRemoteSyncError) {
			switch (error.reason) {
				case TLSyncErrorCloseEventReason.CLIENT_TOO_OLD:
					return { kind: 'refresh' as const }
				case TLSyncErrorCloseEventReason.SERVER_TOO_OLD:
					message =
						'The multiplayer server is out of date. Please reload the page. If the problem persists contact the system administrator.'
					break
				case TLSyncErrorCloseEventReason.INVALID_RECORD:
					message =
						'Your changes were rejected by the server. Please reload the page. If the problem persists contact the system administrator.'
					break
				case TLSyncErrorCloseEventReason.NOT_FOUND:
					header = 'Room not found'
					message = 'The room you are trying to connect to does not exist.'
					break
				case TLSyncErrorCloseEventReason.NOT_AUTHENTICATED:
					return { kind: 'login' as const }
				case TLSyncErrorCloseEventReason.FORBIDDEN:
					header = 'Invite only'
					message = `You don't have permission to view this room.`
					break
				case TLSyncErrorCloseEventReason.RATE_LIMITED:
					header = 'Rate limited'
					message = `Please slow down.`
					break
				case TLSyncErrorCloseEventReason.ROOM_FULL:
					header = 'Room full'
					message = 'This room has reached the maximum number of active collaborators.'
					break
				default:
					console.error('Unhandled sync error', error)
			}
		}
		return { kind: 'page' as const, header, message }
	})
</script>

{#if view.kind === 'refresh'}
	<ErrorPage
		messages={{
			header: 'Refresh the page',
			para1: 'You need to update to the latest version of svelte-draw to continue.',
		}}
	>
		{#snippet cta()}
			<button type="button" onclick={() => window.location.reload()}>Refresh</button>
		{/snippet}
	</ErrorPage>
{:else if view.kind === 'login'}
	<LoginRedirectPage />
{:else}
	<ErrorPage messages={{ header: view.header, para1: view.message }} />
{/if}
