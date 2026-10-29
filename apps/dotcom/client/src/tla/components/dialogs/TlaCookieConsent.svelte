<script lang="ts" module>
	import { fetch } from '@svelte-draw/utils'

	const MANAGE_COOKIES_DIALOG = 'manageCookiesDialog'

	// Asks the consent worker (which reads Cloudflare geolocation headers) whether this
	// region needs explicit consent. Any failure falls back to requiring it.
	async function shouldRequireConsent(): Promise<boolean> {
		try {
			const response = await fetch('https://consent.svelte-draw.invalid')
			if (response.ok) {
				const data = await response.json()
				// Worker returns { requires_consent: boolean, country_code: string }
				if (typeof data.requires_consent === 'boolean') {
					return data.requires_consent
				}
			}
		} catch (error) {
			// Fetch failed or timed out - will default to requiring consent
			console.warn('Consent check failed, defaulting to requiring consent:', error)
		}

		// Conservative default: require consent
		return true
	}
</script>

<script lang="ts">
	import { F, fromComputed, getDialogs } from 'svelte-draw'
	import { getAnalyticsConsent } from '../../hooks/useAnalyticsConsent.svelte'
	import styles from './dialogs.module.css'
	import TlaManageCookiesDialog from './TlaManageCookiesDialog.svelte'

	const { addDialog, dialogs } = getDialogs()
	const isManageCookiesDialogShown = fromComputed('isManageCookiesDialogShown', () =>
		dialogs.get().some((d) => d.id === MANAGE_COOKIES_DIALOG)
	)
	const consent = getAnalyticsConsent()
	let requiresConsent = $state<boolean | null>(null)
	let animationComplete = $state(false)

	// Check if consent is required based on user's location
	$effect(() => {
		if (consent.current !== null) return

		shouldRequireConsent().then((value) => {
			requiresConsent = value

			// Only update consent if it's not required
			if (!value) {
				consent.update(true /* opted-in b/c region doesn't require explicit consent */)
			}
		})
	})

	// Enable pointer events after animation nearly completes
	$effect(() => {
		if (!requiresConsent) return

		const timer = setTimeout(() => {
			animationComplete = true
		}, 3000)

		return () => clearTimeout(timer)
	})

	function handleCustomize() {
		addDialog({
			component: TlaManageCookiesDialog,
			id: MANAGE_COOKIES_DIALOG,
		})
	}
</script>

<!-- Don't show banner if:
     - User has already made a consent choice
     - We haven't determined if consent is required yet
     - Consent is not required in user's region -->
{#if consent.current === null && requiresConsent}
	<!-- If the manage cookies dialog is shown, hide the cookie consent banner but don't remove it
	     or else the animation will replay when it reappears -->
	<div
		class={styles.cookieConsentWrapper}
		style:opacity={isManageCookiesDialogShown.current ? 0 : 1}
		style:pointer-events={animationComplete ? 'auto' : 'none'}
	>
		<div class={styles.cookieConsent} data-testid="tla-cookie-consent">
			<p class={styles.cookieText}>
				<F defaultMessage="This site uses cookies to make the app work and to collect analytics." />
			</p>
			<div class={styles.cookieButtonsRow}>
				<button
					class={['tla-button-text', styles.cookieButton, styles.hoverable]}
					onclick={() => consent.update(false)}
				>
					<F defaultMessage="Opt out" />
				</button>
				<div class={styles.cookieButtons}>
					<button
						class={['tla-button-text', styles.cookieButton, styles.hoverable]}
						onclick={handleCustomize}
					>
						<F defaultMessage="Settings" />
					</button>
					<button
						class={[
							'tla-button-text',
							styles.cookieButton,
							styles.cookieAcceptButton,
							styles.hoverable,
						]}
						onclick={() => consent.update(true)}
					>
						<div class={styles.cookieAcceptButtonTextWrapper}>
							<div class={styles.cookieAcceptButtonText}>
								<F defaultMessage="Accept all" />
							</div>
						</div>
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
