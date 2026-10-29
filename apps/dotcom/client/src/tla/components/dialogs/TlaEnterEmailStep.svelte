<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		enterEmailAddress: { defaultMessage: 'Enter your email address' },
	})
</script>

<script lang="ts">
	import type { GetInviteInfoResponseBody } from '@svelte-draw/dotcom-shared'
	import { F, getTranslation } from 'svelte-draw'
	import { routes } from '../../../routeDefs'
	import { getClerk, getSignIn } from '../../../utils/clerk.svelte'
	import { setRedirectOnSignIn } from '../../utils/redirect'
	import ExternalLink from '../ExternalLink/ExternalLink.svelte'
	import TlaCtaButton from '../TlaCtaButton/TlaCtaButton.svelte'
	import TlaLogo from '../TlaLogo/TlaLogo.svelte'
	import styles from './auth.module.css'
	import { getClerkErrorMessage } from './clerkErrorMessage'
	import GoogleIcon from './GoogleIcon.svelte'

	let {
		onClose,
		onComplete,
		inviteInfo,
		skipRedirect,
	}: {
		onClose?(): void
		onComplete(identifier: string, isSignUpFlow: boolean, emailAddressId?: string): void
		inviteInfo?: Extract<GetInviteInfoResponseBody, { error: false }>
		skipRedirect?: boolean
	} = $props()

	const msg = getTranslation()
	const signInState = getSignIn()
	const clerk = getClerk()

	const form = $state<{ identifier: string; isSubmitting: boolean; error: string | null }>({
		identifier: '',
		isSubmitting: false,
		error: null,
	})

	// React's `client` was always an object; here it is `undefined` until Clerk loads. Using it
	// then throws inside the surrounding `try`, as `undefined.signUp` did.
	function requireClient() {
		const client = clerk.client
		if (!client) throw new Error('Clerk client is not loaded')
		return client
	}

	async function handleEmailSubmit(e: SubmitEvent) {
		e.preventDefault()
		const { signIn, isLoaded: isSignInLoaded } = signInState.current
		if (!isSignInLoaded || !signIn || !form.identifier || form.isSubmitting) return

		form.isSubmitting = true
		form.error = null

		try {
			const res = await signIn.create({ identifier: form.identifier })
			if (res.status === 'complete') {
				await clerk.setActive({ session: res.createdSessionId })
				onClose?.()
				return
			}
			// Prepare email code and move to code stage
			const emailCodeFactor = res.supportedFirstFactors?.find((ff) => ff.strategy === 'email_code')
			const id = emailCodeFactor?.strategy === 'email_code' ? emailCodeFactor.emailAddressId : undefined
			if (!id) {
				form.isSubmitting = false
				form.error = 'Email verification is not available for this account.'
				return
			}
			await signIn.prepareFirstFactor({ strategy: 'email_code', emailAddressId: id })
			onComplete(form.identifier, false, id)
		} catch (err) {
			const apiErrors = (
				err as { errors?: { code?: string; message?: string; longMessage?: string }[] } | undefined
			)?.errors
			const notFound = apiErrors?.find(
				(e) => e.code === 'form_identifier_not_found' || e.code === 'invitation_account_not_exists'
			)
			if (notFound) {
				try {
					const client = requireClient()
					// Initialize sign up with the email before preparing verification
					await client.signUp.create({ emailAddress: form.identifier })
					// Always prepare & go to code first; legal acceptance handled after verification if required
					await client.signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
					onComplete(form.identifier, true, undefined)
				} catch (e) {
					form.isSubmitting = false
					form.error = getClerkErrorMessage(e, 'Something went wrong')
				}
			} else {
				form.isSubmitting = false
				form.error = getClerkErrorMessage(err, 'Something went wrong')
			}
		}
	}

	let isGoogleRedirecting = $state(false)
	async function handleGoogleSignIn() {
		const { signIn, isLoaded: isSignInLoaded } = signInState.current
		if (!isSignInLoaded || !signIn) return
		if (!skipRedirect) setRedirectOnSignIn()
		isGoogleRedirecting = true
		try {
			await signIn.authenticateWithRedirect({
				strategy: 'oauth_google',
				redirectUrl: routes.tlaSsoCallback({ asUrl: true }),
				redirectUrlComplete: routes.tlaRoot({ asUrl: true }),
			})
		} catch (err) {
			isGoogleRedirecting = false
			form.error = getClerkErrorMessage(err, 'Something went wrong')
		}
	}
</script>

{#snippet strong(chunks: string)}<strong>{chunks}</strong>{/snippet}

<div class={styles.authLogoWrapper}>
	<div class={styles.authLogo}>
		<TlaLogo />
	</div>
</div>
<div class={styles.authDescription}>
	{#if inviteInfo}
		<F
			defaultMessage={"You have been invited to join <strong>{workspaceName}</strong>. Create a free account to continue."}
			values={{ workspaceName: inviteInfo.workspaceName }}
			tags={{ strong }}
		/>
	{:else}
		<F
			defaultMessage="Create a free account to save your files and svelte-draw with your teammates."
		/>
	{/if}
</div>
<div class={styles.authGoogleButtonWrapper}>
	<TlaCtaButton
		data-testid="tla-google-sign-in-button"
		class={styles.authCtaButton}
		onclick={handleGoogleSignIn}
		disabled={!signInState.current.isLoaded || isGoogleRedirecting}
	>
		<GoogleIcon />
		<F defaultMessage="Sign in with Google" />
	</TlaCtaButton>
</div>

<div class={styles.authDivider}>
	<span>
		<F defaultMessage="or" />
	</span>
</div>

<form onsubmit={handleEmailSubmit}>
	<div class={styles.authField}>
		<label for="tla-identifier" class={styles.authLabel}>
			<F defaultMessage="Email address" />
		</label>
		<input
			id="tla-identifier"
			name="identifier"
			type="email"
			data-testid="tla-identifier-input"
			bind:value={form.identifier}
			placeholder={msg(messages.enterEmailAddress)}
			class={styles.authInput}
			required
			disabled={form.isSubmitting}
		/>
		{#if form.error}<div class={styles.authError}>{form.error}</div>{/if}
	</div>

	<TlaCtaButton
		data-testid="tla-continue-with-email-button"
		class={[styles.authContinueWithEmailButton, styles.authCtaButton]}
		disabled={form.isSubmitting}
		secondary
		type="submit"
	>
		<F defaultMessage="Continue with email" />
	</TlaCtaButton>

	<p class={styles.authTermsOfUse}>
		<ExternalLink href="/tos.html">
			<F defaultMessage="Terms of Use" />
		</ExternalLink>
		{' · '}
		<ExternalLink href="/privacy.html">
			<F defaultMessage="Privacy Policy" />
		</ExternalLink>
	</p>
</form>
