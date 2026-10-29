<script lang="ts">
	import { captureException } from '@sentry/browser'
	import { routes } from '../../routeDefs'
	import { getAuth, getClerk } from '../../utils/clerk.svelte'
	import { navigate } from '../../utils/router.svelte'
	import { OPEN_SIGN_IN } from '../utils/redirect'

	// Google sign-in returns here. A new Google user arrives as a sign-in that has to be transferred
	// to a sign-up, which only this callback does; without it they land on `/` signed out. Clerk's
	// <AuthenticateWithRedirectCallback /> drops a failure and leaves a blank page, so we call it here.
	const clerk = getClerk()
	const auth = getAuth()
	const isLoaded = $derived(auth.current.isLoaded)

	$effect(() => {
		if (!isLoaded) return
		clerk.instance!.handleRedirectCallback({}).catch((err: unknown) => {
			captureException(err)
			navigate(routes.tlaRoot(), { replace: true, state: { [OPEN_SIGN_IN]: true } })
		})
	})
</script>
