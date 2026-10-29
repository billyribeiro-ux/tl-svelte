<script lang="ts">
	import type { GetInviteInfoResponseBody } from '@svelte-draw/dotcom-shared'
	import {
		SvelteDrawUiDialogBody,
		SvelteDrawUiDialogCloseButton,
		SvelteDrawUiDialogHeader,
		SvelteDrawUiDialogTitle,
	} from 'svelte-draw'
	import styles from './auth.module.css'
	import TlaEnterEmailStep from './TlaEnterEmailStep.svelte'
	import TlaVerificationCodeStep from './TlaVerificationCodeStep.svelte'

	let {
		onClose,
		inviteInfo,
		onInviteAccepted,
		skipRedirect,
	}: {
		onClose?(): void
		inviteInfo?: Extract<GetInviteInfoResponseBody, { error: false }>
		onInviteAccepted?(): void
		skipRedirect?: boolean
	} = $props()

	let stage = $state<'enterEmail' | 'enterCode'>('enterEmail')
	let identifier = $state('')
	let isSignUpFlow = $state(false)
	let emailAddressId = $state<string | undefined>(undefined)
</script>

<div class={styles.authContainer}>
	<SvelteDrawUiDialogHeader>
		<SvelteDrawUiDialogTitle>
			<span></span>
		</SvelteDrawUiDialogTitle>
		{#if onClose}<SvelteDrawUiDialogCloseButton />{/if}
	</SvelteDrawUiDialogHeader>
	<SvelteDrawUiDialogBody class={styles.authDialogBody}>
		<div class={styles.authBody}>
			{#if stage === 'enterEmail'}
				<TlaEnterEmailStep
					{onClose}
					{inviteInfo}
					{skipRedirect}
					onComplete={(id, isSignUp, emailId) => {
						identifier = id
						isSignUpFlow = isSignUp
						emailAddressId = emailId
						stage = 'enterCode'
					}}
				/>
			{:else if stage === 'enterCode'}
				<TlaVerificationCodeStep
					{identifier}
					{isSignUpFlow}
					{emailAddressId}
					onComplete={() => {
						onInviteAccepted?.()
						onClose?.()
					}}
					{onClose}
				/>
			{/if}
		</div>

		<!-- Clerk's CAPTCHA widget -->
		<div id="clerk-captcha" class={styles.clerkCaptcha}></div>
	</SvelteDrawUiDialogBody>
</div>
