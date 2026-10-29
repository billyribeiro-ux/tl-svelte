/*
 * The part of `react-ga4` (2.1.0) the app used, without the package: it is a thin wrapper over
 * `gtag.js` that has nothing to do with React, and this app called only `gtag`, `initialize`, `set`,
 * `event` and `reset`. Behaviour is copied from `react-ga4/dist/ga4.js` and `dist/gtag.js`.
 */

type GtagArgs = unknown[]

declare global {
	interface Window {
		dataLayer?: unknown[]
		gtag?(...args: GtagArgs): void
	}
}

// react-ga4 `_toGtagOptions`: the Universal Analytics field names callers still use.
const MAP_FIELDS: Record<string, string> = {
	cookieUpdate: 'cookie_update',
	cookieExpires: 'cookie_expires',
	cookieDomain: 'cookie_domain',
	cookieFlags: 'cookie_flags',
	userId: 'user_id',
	clientId: 'client_id',
	anonymizeIp: 'anonymize_ip',
	contentGroup1: 'content_group1',
	contentGroup2: 'content_group2',
	contentGroup3: 'content_group3',
	contentGroup4: 'content_group4',
	contentGroup5: 'content_group5',
	allowAdFeatures: 'allow_google_signals',
	allowAdPersonalizationSignals: 'allow_ad_personalization_signals',
	nonInteraction: 'non_interaction',
	page: 'page_path',
	hitCallback: 'event_callback',
}

function toGtagOptions(options: Record<string, unknown> | undefined) {
	if (!options) return undefined
	return Object.entries(options).reduce<Record<string, unknown>>((acc, [key, value]) => {
		acc[MAP_FIELDS[key] ?? key] = value
		return acc
	}, {})
}

function gtag(...args: GtagArgs) {
	if (typeof window === 'undefined') return
	if (typeof window.gtag === 'undefined') {
		window.dataLayer = window.dataLayer || []
		// gtag.js reads `arguments` objects off the data layer; an array of args is not the same thing.
		window.gtag = function gtag() {
			// eslint-disable-next-line prefer-rest-params
			window.dataLayer!.push(arguments)
		}
	}
	window.gtag(...args)
}

class GA4 {
	isInitialized = false
	#hasLoadedGA = false

	#loadGA(measurementId: string) {
		if (typeof window === 'undefined' || typeof document === 'undefined') return
		if (this.#hasLoadedGA) return
		const script = document.createElement('script')
		script.async = true
		script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
		document.body.appendChild(script)
		window.dataLayer = window.dataLayer || []
		window.gtag = function gtag() {
			// eslint-disable-next-line prefer-rest-params
			window.dataLayer!.push(arguments)
		}
		this.#hasLoadedGA = true
	}

	/** `ReactGA.gtag(...)`. */
	gtag(...args: GtagArgs) {
		gtag(...args)
	}

	/** `ReactGA.initialize(id, { gtagOptions })`. */
	initialize(measurementId: string, options: { gtagOptions?: Record<string, unknown> } = {}) {
		if (!measurementId) throw new Error('Require GA_MEASUREMENT_ID')
		this.#loadGA(measurementId)
		if (!this.isInitialized) {
			gtag('js', new Date())
			const merged = { ...options.gtagOptions }
			if (Object.keys(merged).length) gtag('config', measurementId, merged)
			else gtag('config', measurementId)
		}
		this.isInitialized = true
	}

	/** `ReactGA.set({ userId, anonymize_ip })`: `gtag('set', ...)` with UA field names translated. */
	set(fields: Record<string, unknown>) {
		if (!fields) {
			console.warn('`fieldsObject` is required in .set()')
			return
		}
		if (typeof fields !== 'object') {
			console.warn('Expected `fieldsObject` arg to be an Object')
			return
		}
		if (Object.keys(fields).length === 0) console.warn('empty `fieldsObject` given to .set()')
		gtag('set', toGtagOptions(fields))
	}

	/** `ReactGA.event(name, params)`. */
	event(name: string, params?: Record<string, unknown>) {
		gtag('event', name, toGtagOptions(params))
	}

	/** `ReactGA.reset()`: forgets that gtag was initialised and loaded. */
	reset() {
		this.isInitialized = false
		this.#hasLoadedGA = false
	}
}

export const ga4 = new GA4()
