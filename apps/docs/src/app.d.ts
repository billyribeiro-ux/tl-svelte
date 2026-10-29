// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface ConsentPreferences {
		analytics: 'granted' | 'denied'
		marketing: 'granted' | 'denied'
	}

	interface Window {
		tlanalytics: {
			openPrivacySettings(): void
			track(name: string, data?: { [key: string]: any }): void
			gtag(...args: any[]): void
			getConsentState(): ConsentPreferences
			onConsentUpdate(callback: (preferences: ConsentPreferences) => void): () => void
			trackCopyCode(data: {
				page_category: string
				text_snippet: string
				user_email?: string
				user_email_sha256?: string
				user_first_name?: string
				user_last_name?: string
				user_phone_number?: string
			}): void
			trackFormSubmission(data: {
				enquiry_type: string
				page_category?: string
				company_size?: string
				company_website?: string
				user_email?: string
				user_email_sha256?: string
				user_first_name?: string
				user_last_name?: string
				user_phone_number?: string
			}): void
		}
		TL_GA4_MEASUREMENT_ID: string | undefined
		TL_GOOGLE_ADS_ID?: string
		TL_GTM_CONTAINER_ID?: string
		posthog: any
	}
}

export {}
