<script lang="ts">
	import { getDialogs } from 'svelte-draw'
	import { routes } from '../../routeDefs'
	import { getAuth } from '../../utils/clerk.svelte'
	import { navigate, searchParams } from '../../utils/router.svelte'
	import TlaSignInDialog from '../components/dialogs/TlaSignInDialog.svelte'
	import { setRedirectOnSignIn } from '../utils/redirect'

	/**
	 * When logged out with a url, shows sign-in dialog on this page (like invite). When signed in,
	 * redirects to / with the url in location state so local runs the import.
	 */
	const auth = getAuth()
	const { addDialog } = getDialogs()
	const url = $derived(searchParams.get('url'))
	const isLoaded = $derived(auth.current.isLoaded)
	const isSignedIn = $derived(auth.current.isSignedIn)
	let dialogShown = false

	$effect(() => {
		if (!url?.trim()) {
			navigate(routes.tlaRoot(), { replace: true })
			return
		}
		if (!isLoaded) return

		if (isSignedIn) {
			navigate(routes.tlaRoot(), { replace: true, state: { importUrl: url } })
			return
		}

		if (dialogShown) return
		dialogShown = true
		setRedirectOnSignIn()
		addDialog({
			component: TlaSignInDialog,
		})
	})
</script>
