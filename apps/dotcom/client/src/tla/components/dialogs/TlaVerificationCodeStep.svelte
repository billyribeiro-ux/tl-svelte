<script lang="ts">
	import { F } from 'svelte-draw'
	import { getClerk } from '../../../utils/clerk.svelte'
	import styles from './auth.module.css'
	import { getClerkErrorMessage } from './clerkErrorMessage'

	let {
		isSignUpFlow,
		identifier,
		emailAddressId,
		onClose,
		onComplete,
	}: {
		isSignUpFlow: boolean
		onClose?(): void
		identifier: string
		emailAddressId: string | undefined
		onComplete(): void
	} = $props()

	const clerk = getClerk()

	const form = $state({
		code: '',
		isCodeFocused: false,
		isSubmitting: false,
		error: null as string | null,
	})

	let resendCooldown = $state(0)
	let resendError = $state<string | null>(null)
	let codeInput = $state<HTMLInputElement | null>(null)

	$effect(() => {
		if (resendCooldown <= 0) return
		const timer = window.setInterval(() => {
			resendCooldown = resendCooldown <= 1 ? 0 : resendCooldown - 1
		}, 1000)
		return () => window.clearInterval(timer)
	})

	function handleCodeChange(e: Event & { currentTarget: HTMLInputElement }) {
		const input = e.currentTarget
		const next = input.value.replace(/[^0-9]/g, '').slice(0, 6)
		// The input is controlled: write back what was kept, so a rejected character does not stay
		// in the field when the state it maps to did not change.
		if (form.isSubmitting) {
			input.value = form.code
			return
		}
		input.value = next

		form.error = ''
		form.code = next

		// If the length is 6, we need to submit the code
		if (next.length < 6) return

		form.isSubmitting = true
		form.error = null

		const client = clerk.client
		const attempt: Promise<{ status: string | null; createdSessionId: string | null }> | undefined =
			isSignUpFlow
				? client?.signUp.attemptEmailAddressVerification({ code: next })
				: client?.signIn?.attemptFirstFactor({ strategy: 'email_code', code: next })
		if (!attempt) return

		attempt
			.then(async (r) => {
				if (r.status === 'complete') {
					await clerk.setActive({ session: r.createdSessionId })
					onComplete()
					return
				}
				form.isSubmitting = false
				onClose?.()
			})
			.catch((e) => {
				form.code = ''
				form.isSubmitting = false
				form.error = getClerkErrorMessage(e, 'Invalid code')
			})
	}

	async function handleResend() {
		if (resendCooldown > 0 || form.isSubmitting) return
		resendError = null
		try {
			const client = clerk.client
			if (!client) throw new Error('Clerk client is not loaded')
			if (isSignUpFlow) {
				// Ensure email is set on signUp in case the client lost state
				if (!client.signUp.emailAddress && identifier) {
					await client.signUp.update({ emailAddress: identifier })
				}
				await client.signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
			} else if (client.signIn && emailAddressId) {
				await client.signIn.prepareFirstFactor({
					strategy: 'email_code',
					emailAddressId,
				})
			}
			resendCooldown = 30
		} catch (e) {
			resendError = getClerkErrorMessage(e, 'Unable to resend code')
		}
	}

	// Equivalent of React's `autoFocus`: focus the element when it mounts.
	function autoFocus(element: HTMLInputElement) {
		element.focus()
	}
</script>

{#snippet resend(chunks: string)}
	<button
		type="button"
		data-testid="tla-resend-code-button"
		onclick={handleResend}
		class={styles.authResendButton}
		disabled={resendCooldown > 0 || form.isSubmitting}
	>
		{#if resendCooldown > 0}
			{chunks} ({resendCooldown})
		{:else}
			{chunks}
		{/if}
	</button>
{/snippet}

<p class={styles.authDescription}>
	<F defaultMessage="Check your email for a verification code." />
</p>

<!-- The wrapper only forwards a click to the real input, which is keyboard-reachable on its own. -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class={styles.authVerificationWrapper} onclick={() => codeInput?.focus()}>
	<div class={styles.authOtpBoxes} aria-hidden="true">
		{#each { length: 6 } as _, i (i)}
			{@const isFilled = form.code[i]}
			{@const isFocused = form.isCodeFocused && form.code.length < 6 && i === form.code.length}
			<div
				class={[
					styles.authOtpBox,
					{ [styles.authOtpBoxFilled]: isFilled, [styles.authOtpBoxFocused]: isFocused },
				]}
			>
				{isFilled || ''}
				{#if isFocused}<span class={styles.authOtpCaret}></span>{/if}
			</div>
		{/each}
	</div>
	<input
		bind:this={codeInput}
		{@attach autoFocus}
		id="tla-verification-code"
		data-testid="tla-verification-code-input"
		type="text"
		inputmode="numeric"
		class={styles.authOtpHiddenInput}
		value={form.code}
		oninput={handleCodeChange}
		onfocus={() => (form.isCodeFocused = true)}
		onblur={() => (form.isCodeFocused = false)}
		disabled={form.isSubmitting}
		maxlength={6}
	/>
</div>

{#if form.error}<div class={styles.authError}>{form.error}</div>{/if}
{#if resendError}<div class={styles.authError}>{resendError}</div>{/if}

<div class={styles.authResendWrapper}>
	<span class={styles.authResendText}>
		<F defaultMessage="Didn’t receive a code? <resend>Resend</resend>." tags={{ resend }} />
	</span>
</div>
