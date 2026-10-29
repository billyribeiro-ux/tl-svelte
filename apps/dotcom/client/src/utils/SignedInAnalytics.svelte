<script lang="ts">
	import { afterNavigate } from '$app/navigation'
	import { fromComputed } from 'svelte-draw'
	import { getApp } from '../tla/hooks/useAppState.svelte'
	import { setupSignUpTracking } from '../tla/hooks/useSignUpTracking.svelte'
	import { analyticsConsent, configureAnalytics, setStoredAnalyticsConsent, trackEvent } from './analytics'

	const app = getApp()
	const userData = fromComputed('userData', () => app.current.getUser())

	// Primitives, so the effect re-runs only when one of the fields it used changes, not for every
	// edit to the user row (each re-run re-identifies the user with PostHog).
	const userId = $derived(userData.current.id)
	const userName = $derived(userData.current.name)
	const userEmail = $derived(userData.current.email)
	const userConsent = $derived(userData.current.allowAnalyticsCookie)

	$effect(() => {
		const storedConsent = analyticsConsent.current
		const user = { id: userId, name: userName, email: userEmail }

		// If user has no preference in database but has one in atom/localStorage, sync it
		if (userConsent === null && storedConsent !== null) {
			app.current.updateUser({ id: user.id, allowAnalyticsCookie: storedConsent })
		}

		// Sync database consent to atom/localStorage to keep them in sync
		// This will run if a logged in user changes their preference
		if (userConsent !== null && userConsent !== storedConsent) {
			setStoredAnalyticsConsent(userConsent)
		}

		// Use user's database preference if available, otherwise fall back to stored consent
		const finalConsent = userConsent !== null ? userConsent : storedConsent === true

		configureAnalytics(finalConsent, user)
	})

	afterNavigate(() => {
		trackEvent('$pageview')
	})
	setupSignUpTracking()
</script>
