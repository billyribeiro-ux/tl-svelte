import { fromComputed } from 'svelte-draw'
import {
	analyticsConsent,
	configureAnalytics,
	setStoredAnalyticsConsent,
	trackEvent,
} from '../../utils/analytics'
import { getAuth } from '../../utils/clerk.svelte'
import { getMaybeApp } from './useAppState.svelte'

/**
 * Tracks analytics consent changes.
 * Consent can be either a boolean (user has set their preference) or null (user has not set their preference yet).
 * `.current` is the current consent state, `.update` changes it.
 */
export function getAnalyticsConsent(): {
	readonly current: boolean | null
	update(newConsent: boolean): void
} {
	const app = getMaybeApp()
	const auth = getAuth()
	const user = fromComputed('user', () => app.current?.getUser())

	return {
		get current() {
			const isSignedIn = !!auth.current.isSignedIn
			return isSignedIn && user.current && app.current
				? user.current.allowAnalyticsCookie
				: analyticsConsent.current
		},
		update(newConsent: boolean) {
			const isSignedIn = !!auth.current.isSignedIn
			const currentUser = user.current
			const currentApp = app.current
			// Also update localStorage and atom to keep them in sync
			setStoredAnalyticsConsent(newConsent)
			if (isSignedIn && currentUser && currentApp) {
				currentApp.updateUser({ id: currentUser.id, allowAnalyticsCookie: newConsent })
				// Immediately configure analytics
				configureAnalytics(newConsent, {
					id: currentUser.id,
					name: currentUser.name,
					email: currentUser.email,
				})
			} else {
				// Immediately configure analytics for signed-out users
				configureAnalytics(newConsent, undefined)
			}

			trackEvent('consent_changed', { consent: newConsent })
		},
	}
}
