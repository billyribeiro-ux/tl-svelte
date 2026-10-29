<script lang="ts">
	import { routes } from '../../routeDefs'
	import { navigate } from '../../utils/router.svelte'
	import { OPEN_SIGN_IN, setRedirect } from '../utils/redirect'

	// `/` signs the user in (it ignores Clerk's `redirect_url`) or shows the legal terms, then comes
	// back here through the app's own post-sign-in redirect.
	let { openSignIn = false }: { openSignIn?: boolean } = $props()

	$effect(() => {
		setRedirect(window.location.pathname + window.location.search)
		navigate(routes.tlaRoot(), {
			replace: true,
			state: openSignIn ? { [OPEN_SIGN_IN]: true } : undefined,
		})
	})
</script>
