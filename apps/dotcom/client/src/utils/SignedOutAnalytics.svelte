<script lang="ts">
	import { afterNavigate } from '$app/navigation'
	import { analyticsConsent, configureAnalytics, trackEvent } from './analytics'

	const storedConsent = analyticsConsent

	$effect(() => {
		configureAnalytics(storedConsent.current === true, undefined)
		document.getElementById('reo-iframe-loader')?.remove()
	})

	// Fires on mount and after every navigation, as the `[location]` effect did.
	afterNavigate(() => {
		trackEvent('$pageview')
	})
</script>
