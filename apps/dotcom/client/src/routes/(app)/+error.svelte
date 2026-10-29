<script lang="ts">
	import { page } from '$app/state'
	import type { TLSyncErrorCloseEventReason } from '@svelte-draw/sync-core'
	import ErrorPage from '../../components/ErrorPage/ErrorPage.svelte'
	import LoginRedirectPage from '../../components/LoginRedirectPage/LoginRedirectPage.svelte'
	import NotFound from '../../pages/not-found.svelte'
	import { TlaNotFoundError } from '../../tla/utils/notFoundError'
	import { isRemoteSyncError } from '../../utils/routeErrors'

	// The route tree's root ErrorBoundary. Reporting happens once, in `handleError`
	// (src/hooks.client.ts), instead of in an effect here.
	const error = $derived(page.error?.original ?? page.error)

	const view = $derived.by(() => {
		let header = 'Something went wrong'
		let para1 =
			'Please try refreshing the page. Still having trouble? Let us know at hello@svelte-draw.invalid.'
		if (isRemoteSyncError(error)) {
			switch (error.reason as TLSyncErrorCloseEventReason) {
				case 'NOT_FOUND': {
					header = 'Not found'
					para1 = 'The file you are looking for does not exist.'
					break
				}
				case 'NOT_AUTHENTICATED': {
					return { kind: 'login' } as const
				}
				case 'FORBIDDEN': {
					header = 'Invite only'
					para1 = `You don't have permission to view this room.`
					break
				}
				case 'RATE_LIMITED': {
					header = 'Rate limited'
					para1 = `Please slow down.`
					break
				}
			}
		}
		if (error instanceof TlaNotFoundError) return { kind: 'not-found' } as const
		return { kind: 'error', header, para1 } as const
	})
</script>

{#if view.kind === 'login'}
	<LoginRedirectPage />
{:else if view.kind === 'not-found'}
	<NotFound />
{:else}
	<ErrorPage messages={{ header: view.header, para1: view.para1 }} />
{/if}
