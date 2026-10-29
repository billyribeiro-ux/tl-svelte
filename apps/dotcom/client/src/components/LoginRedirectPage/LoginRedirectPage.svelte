<script lang="ts">
	import { getClerk } from '../../utils/clerk.svelte'

	const clerk = getClerk()

	// Once, at initialisation, as the render-phase assignment did.
	const signInUrl = clerk.buildSignInUrl({
		signInForceRedirectUrl: window.location.href,
		signUpForceRedirectUrl: window.location.href,
	})
	window.location.href = signInUrl
</script>
