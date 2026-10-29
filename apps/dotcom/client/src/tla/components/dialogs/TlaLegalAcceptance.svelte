<script lang="ts">
	import { F, SvelteDrawUiDialogBody, SvelteDrawUiDialogHeader, SvelteDrawUiDialogTitle } from 'svelte-draw'
	import { getUser } from '../../../utils/clerk.svelte'
	import ExternalLink from '../ExternalLink/ExternalLink.svelte'
	import TlaCtaButton from '../TlaCtaButton/TlaCtaButton.svelte'
	import styles from './auth.module.css'

	let { onClose }: { onClose(): void } = $props()

	interface ClerkErrorShape {
		errors?: { longMessage?: string; message?: string }[]
		message?: string
	}

	const clerkUser = getUser()

	let isSubmitting = $state(false)
	let error = $state<string | null>(null)

	async function handleContinue() {
		if (isSubmitting) return

		isSubmitting = true
		error = null

		try {
			const user = clerkUser.current.user
			if (!user) return

			// Store acceptance in user metadata
			await user.update({
				unsafeMetadata: {
					...user.unsafeMetadata,
					legal_accepted_at: new Date().toISOString(),
				},
			})
			await user.reload()

			onClose()
		} catch (e) {
			const err = e as ClerkErrorShape | undefined
			error =
				err?.errors?.[0]?.longMessage ||
				err?.errors?.[0]?.message ||
				err?.message ||
				'Something went wrong'
		} finally {
			isSubmitting = false
		}
	}
</script>

{#snippet tos(chunks: string)}
	<ExternalLink href="/tos.html">{chunks}</ExternalLink>
{/snippet}
{#snippet privacy(chunks: string)}
	<ExternalLink href="/privacy.html">{chunks}</ExternalLink>
{/snippet}

<div class={styles.legalContainer}>
	<SvelteDrawUiDialogHeader class={styles.legalDialogHeader}>
		<SvelteDrawUiDialogTitle>
			<F defaultMessage="Accept terms of use" />
		</SvelteDrawUiDialogTitle>
	</SvelteDrawUiDialogHeader>
	<SvelteDrawUiDialogBody class={styles.legalBody}>
		<p class={styles.legalDescription}>
			<F
				defaultMessage="Before you start, please accept our <tos>terms of use</tos> and <privacy>privacy policy</privacy>."
				tags={{ tos, privacy }}
			/>
		</p>

		{#if error}<div class={styles.authError}>{error}</div>{/if}
		<TlaCtaButton
			data-testid="tla-accept-and-continue-button"
			onclick={handleContinue}
			disabled={isSubmitting}
			class={[styles.authCtaButton, styles.legalCtaButton]}
		>
			<F defaultMessage="Accept and continue" />
		</TlaCtaButton>
	</SvelteDrawUiDialogBody>
</div>
