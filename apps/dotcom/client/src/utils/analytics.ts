import { FEATURE_FLAG_KEYS } from '@svelte-draw/dotcom-shared'
import posthog, { type PostHogConfig, type Properties } from 'posthog-js'
import 'posthog-js/dist/web-vitals'
import {
	atom,
	fromComputed,
	getFromLocalStorage,
	react,
	setInLocalStorage,
	warnOnce,
} from 'svelte-draw'
import { getCurrentFlags, hasResolvedFlagsOnce } from '../tla/utils/featureFlags'
import {
	commonRoom,
	configureCommonRoom,
	shouldUseCommonRoom,
	trackCommonRoomPageview,
} from './common-room-signals'
import { ga4 } from './ga4'

// Local storage key for cookie consent
export const COOKIE_CONSENT_KEY = 'svelteDraw_cookie_consent'

// Cookie consent structure
interface CookieConsent {
	analytics: boolean
	// Future consent types can be added here
	// marketing?: boolean
	// functional?: boolean
}

// Cookie consent atom - stores the full consent object
export const cookieConsent = atom<CookieConsent | null>('cookie consent', getStoredCookieConsent())

// React to changes in the atom and sync with localStorage
react('sync cookie consent to localStorage', () => {
	const consent = cookieConsent.get()
	if (consent !== null) {
		try {
			setInLocalStorage(COOKIE_CONSENT_KEY, JSON.stringify(consent))
		} catch {
			// Ignore localStorage errors
		}
	}
})

// The stored analytics consent, `null` until the visitor has chosen. Was `useAnalyticsConsentValue()`;
// read `.current` where the hook's return value was used.
export const analyticsConsent = fromComputed(
	'analytics consent',
	(): boolean | null => cookieConsent.get()?.analytics ?? null
)

type AnalyticsOptions =
	| {
			optedIn: true
			user:
				| {
						id: string
						name: string
						email: string
				  }
				| undefined
	  }
	| {
			optedIn: false
			user?: {
				id: string
				name: string
				email: string
			}
	  }

// @ts-ignore this is fine
const POSTHOG_KEY: string | undefined = import.meta.env.VITE_POSTHOG_KEY
const shouldUsePosthog = POSTHOG_KEY !== undefined

// @ts-ignore this is fine
const GA4_MEASUREMENT_ID: string | undefined = import.meta.env.VITE_GA4_MEASUREMENT_ID
const shouldUseGA4 = GA4_MEASUREMENT_ID !== undefined

const PROPERTIES_TO_REDACT = ['url', 'href', 'pathname']

// Match property names against the defined list
function filterProperties(value: { [key: string]: any }) {
	return Object.entries(value).reduce<{ [key: string]: any }>((acc, [key, value]) => {
		// N.B. This isn't super obvious but Posthog has keys that can be like
		// `$pathname` for native events, but also you could have `pathname` for custom events.
		// So we check for both here.
		if (PROPERTIES_TO_REDACT.some((prop) => key.includes(prop))) {
			acc[key] = 'redacted'
		} else {
			acc[key] = value
		}
		return acc
	}, {})
}

/**
 * App feature flags for PostHog event properties; null until `/api/app/feature-flags` has succeeded, so a failed
 * fetch doesn't report its defaults as real "off" values.
 * Only used for signed-in users — percentage flags are not evaluated for anonymous requests on the server.
 * We attach here (not via setPersonProperties) so each event carries the values this page load
 * evaluated. Person-level cohorts from flags alone would need extra sync.
 */
function getAppFeatureFlagEventProperties(): Record<string, boolean> | null {
	if (!hasResolvedFlagsOnce()) return null
	const flags = getCurrentFlags()
	return FEATURE_FLAG_KEYS.reduce<Record<string, boolean>>((acc, key) => {
		acc[`ff_${key}`] = !!flags[key]?.enabled
		return acc
	}, {})
}

// Helper functions for localStorage consent management
export function getStoredCookieConsent(): CookieConsent | null {
	try {
		const stored = getFromLocalStorage(COOKIE_CONSENT_KEY)
		if (!stored) return null
		return JSON.parse(stored) as CookieConsent
	} catch {
		return null
	}
}

export function setStoredCookieConsent(consent: Partial<CookieConsent>): void {
	const existing = cookieConsent.get() || {}
	const updated = { ...existing, ...consent }
	// Ensure we only set the atom if we have a complete CookieConsent object
	if (updated.analytics !== undefined) {
		cookieConsent.set(updated as CookieConsent)
	}
}

export function setStoredAnalyticsConsent(consent: boolean): void {
	setStoredCookieConsent({ analytics: consent })
}

// Function to configure analytics when consent changes
export function configureAnalytics(
	consent: boolean,
	user: { id: string; name: string; email: string } | undefined
) {
	configureCommonRoom(consent, user)

	configurePosthog({
		optedIn: consent,
		user,
	} as AnalyticsOptions)

	configureGA4({
		optedIn: consent,
		user,
	} as AnalyticsOptions)

	if (user) {
		setupReo({
			optedIn: consent,
			user,
		})
	}
}

let currentOptionsPosthog: AnalyticsOptions | null = null
let eventBufferPosthog: null | Array<{ name: string; data: Properties | null | undefined }> = []
function configurePosthog(options: AnalyticsOptions) {
	if (!shouldUsePosthog) return

	const hashParams = new URLSearchParams(window.location.hash.substring(1))
	const sessionID = hashParams.get('session_id')
	const distinctID = hashParams.get('distinct_id')
	const config: Partial<PostHogConfig> = {
		api_host: 'https://analytics.svelte-draw.invalid/i',
		ui_host: 'https://eu.i.posthog.com',
		capture_pageview: false,
		cookieless_mode: 'on_reject',
		disable_surveys: true,
		before_send: (payload) => {
			if (!payload) return null
			const props = payload.properties || {}
			payload.properties = props
			props.is_signed_in = !!options.user

			const flagProps = options.user ? getAppFeatureFlagEventProperties() : null
			if (flagProps) {
				Object.assign(props, flagProps)
			}

			payload.properties = filterProperties(props)

			// $set
			payload.$set = filterProperties(payload.$set || {})

			// $set_once
			payload.$set_once = filterProperties(payload.$set_once || {})

			return payload
		},
		bootstrap:
			sessionID && distinctID
				? {
						sessionID,
						distinctID,
					}
				: undefined,
	}
	if (!currentOptionsPosthog) {
		// First time initialization only
		posthog.init(POSTHOG_KEY, config)
	} else {
		// We need to call _before_ opt_in/opt_out to avoid interfering with
		// their state management
		posthog.set_config(config)
	}

	if (options.optedIn) {
		if (options.user) {
			posthog.identify(options.user.id, {
				email: options.user.email,
				name: options.user.name,
				analytics_consent: true,
			})
		}
		posthog.opt_in_capturing()
	} else if (cookieConsent.get()?.analytics === false) {
		// Keyed on stored consent, not the previous options: a persisted PostHog opt-in would
		// otherwise survive a reload with consent already off, and a first reject never engages
		// cookieless_mode.
		if (currentOptionsPosthog?.optedIn) {
			posthog.setPersonProperties({ analytics_consent: false })
		}
		// An explicit opt-out is already persisted and opt_out_capturing emits its own $pageview.
		if (posthog.get_explicit_consent_status() !== 'denied') {
			posthog.opt_out_capturing()
		}
	}

	currentOptionsPosthog = options
	eventBufferPosthog?.forEach((event) => posthog.capture(event.name, event.data))
	eventBufferPosthog = null
}

let currentOptionsGA4: AnalyticsOptions | null = null
let eventBufferGA4: null | Array<{ name: string; data: Properties | null | undefined }> = []
function configureGA4(options: AnalyticsOptions) {
	if (!shouldUseGA4) return

	if (!currentOptionsGA4) {
		ga4.gtag('consent', 'default', {
			ad_storage: 'denied',
			ad_user_data: 'denied',
			ad_personalization: 'denied',
			analytics_storage: 'denied',
			// Wait for our cookie to load.
			wait_for_update: 500,
		})

		// Set up conversion linker for cross-domain tracking with svelte-draw.invalid
		// Must be set before ga4.initialize() to ensure it's configured before gtag('config')
		ga4.gtag('set', 'linker', {
			domains: ['svelte-draw.invalid'],
		})

		ga4.initialize(GA4_MEASUREMENT_ID, {
			gtagOptions: {
				send_page_view: false,
			},
		})
	}

	if (options.optedIn) {
		if (options.user) {
			ga4.set({ userId: options.user.id, anonymize_ip: false })
		}
		ga4.gtag('consent', 'update', {
			ad_user_data: 'granted',
			ad_personalization: 'granted',
			ad_storage: 'granted',
			analytics_storage: 'granted',
		})
	} else if (currentOptionsGA4?.optedIn) {
		ga4.set({ anonymize_ip: true })
		ga4.reset()

		ga4.gtag('consent', 'update', {
			ad_user_data: 'denied',
			ad_personalization: 'denied',
			ad_storage: 'denied',
			analytics_storage: 'denied',
		})
	}

	currentOptionsGA4 = options
	eventBufferGA4?.forEach((event) => ga4!.event(event.name, event.data ?? {}))
	eventBufferGA4 = null
}

function getPosthog() {
	if (!shouldUsePosthog) return null
	if (!currentOptionsPosthog) {
		warnOnce('getPosthog called before configurePosthog - buffering')
		return {
			capture(name: string, data: any) {
				eventBufferPosthog?.push({ name, data })
			},
		}
	}
	return posthog
}

function getGA4() {
	if (!shouldUseGA4) return null
	if (!currentOptionsGA4) {
		warnOnce('getGA4 called before configureGA4 - buffering')
		return {
			event(name: string, data: any) {
				eventBufferGA4?.push({ name, data })
			},
		}
	}
	return ga4
}

export function trackEvent(name: string, data?: { [key: string]: any }) {
	getPosthog()?.capture(name, data)

	if (name === '$pageview') {
		getGA4()?.event('page_view', data)
		trackCommonRoomPageview()
	}

	// Track new-account sign-ups in GA4 as well as PostHog. This is the conversion
	// used to measure paid traffic (e.g. Google Ads) landing on svelte-draw.invalid. It is
	// fired once per new account by useSignUpTracking, not on every login.
	if (name === 'sign_up') {
		getGA4()?.event('sign_up', data)
	}

	// Track watermark clicks in GA4
	if (name === 'click-watermark' && data?.url) {
		if (getGA4()) {
			ga4.gtag('event', 'click_svelteDraw_dev', {
				link_url: data.url,
			})
		}
	}
}

/** The handler `<SvelteDraw onUiEvent>` is given. Was `useHandleUiEvents()`. */
export function getHandleUiEvents() {
	return trackEvent
}

function setupReo(options: AnalyticsOptions) {
	if (options.optedIn === false) return

	const user = options.user

	function postToReoIframe(type: 'identify', payload?: any) {
		const iframe = document.getElementById('reo-iframe-loader') as HTMLIFrameElement | null
		if (iframe?.contentWindow) {
			iframe.contentWindow.postMessage({ type, payload })
		}
	}

	const reoIdentify = () =>
		postToReoIframe('identify', {
			firstname: user?.name || '',
			username: user?.email || '',
			type: 'email',
			userId: user?.id || '',
		})

	if (!document.getElementById('reo-iframe-loader')) {
		const iframeTag = document.createElement('iframe')
		iframeTag.id = 'reo-iframe-loader'
		iframeTag.style.display = 'none'
		iframeTag.src = '/reo.html'
		iframeTag.onload = () => reoIdentify()
		document.body.appendChild(iframeTag)
	} else {
		reoIdentify()
	}
}

export function signoutAnalytics() {
	if (shouldUseCommonRoom) commonRoom.reset()
	if (shouldUsePosthog) posthog.reset()
	if (shouldUseGA4) ga4.reset()
}
