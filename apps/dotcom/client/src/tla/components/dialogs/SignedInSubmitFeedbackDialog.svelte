<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		submitted: { defaultMessage: 'Feedback submitted' },
		thanks: { defaultMessage: 'Thanks for helping us improve svelte-draw!' },
		failed: { defaultMessage: 'Could not submit feedback' },
		tryAgain: { defaultMessage: 'Please try again.' },
	})

	const descriptionKey = 'svelte-draw-feedback-description'
</script>

<script lang="ts">
	import { addBreadcrumb, captureException } from '@sentry/browser'
	import type { SubmitFeedbackRequestBody } from '@svelte-draw/dotcom-shared'
	import {
		deleteFromLocalStorage,
		F,
		fetch,
		getFromLocalStorage,
		getToasts,
		setInLocalStorage,
		SvelteDrawUiButton,
		SvelteDrawUiButtonCheck,
		SvelteDrawUiButtonLabel,
		SvelteDrawUiDialogBody,
		SvelteDrawUiDialogCloseButton,
		SvelteDrawUiDialogFooter,
		SvelteDrawUiDialogHeader,
		SvelteDrawUiDialogTitle,
	} from 'svelte-draw'
	import { getIntl } from '../../../utils/intl'
	import DiscordLink from './DiscordLink.svelte'
	import styles from './dialogs.module.css'
	import GithubIssuesLink from './GithubIssuesLink.svelte'

	let { onClose }: { onClose(): void } = $props()

	let input = $state<HTMLTextAreaElement | null>(null)
	let includeFileLink = $state(true)
	let isSubmitting = $state(false)
	const toasts = getToasts()
	const intl = getIntl()
	const initialDescription = getFromLocalStorage(descriptionKey) ?? undefined

	async function onSubmit() {
		const description = input?.value?.trim()
		if (!description || isSubmitting) return
		isSubmitting = true
		try {
			const r = await fetch('/api/app/submit-feedback', {
				method: 'POST',
				body: JSON.stringify({
					allowContact: true,
					description,
					url: includeFileLink
						? window.location.href.replace('https', 'https-please-be-mindful')
						: '',
				} satisfies SubmitFeedbackRequestBody),
			})
			if (!r.ok) {
				throw new Error('Failed to submit feedback ' + r.status)
			}
		} catch (e) {
			// Keep the dialog (and the saved draft) so the text isn't lost on a failed send.
			// Don't attach the draft to the report: it's unsent user text and shouldn't reach Sentry.
			addBreadcrumb({ message: 'Failed to submit feedback' })
			captureException(e)
			toasts.addToast({
				severity: 'error',
				title: intl.current.formatMessage(messages.failed),
				description: intl.current.formatMessage(messages.tryAgain),
			})
			isSubmitting = false
			return
		}
		deleteFromLocalStorage(descriptionKey)
		onClose()
		toasts.addToast({
			severity: 'success',
			title: intl.current.formatMessage(messages.submitted),
			description: intl.current.formatMessage(messages.thanks),
		})
	}

	// Focus the input when the dialog opens, select all text
	$effect(() => {
		if (input) {
			input.focus()
			input.select()
		}
	})
</script>

{#snippet discord(chunks: string)}<DiscordLink>{chunks}</DiscordLink>{/snippet}
{#snippet github(chunks: string)}<GithubIssuesLink>{chunks}</GithubIssuesLink>{/snippet}

<SvelteDrawUiDialogHeader>
	<SvelteDrawUiDialogTitle>
		<F defaultMessage="Send feedback" />
	</SvelteDrawUiDialogTitle>
	<SvelteDrawUiDialogCloseButton />
</SvelteDrawUiDialogHeader>
<SvelteDrawUiDialogBody class={styles.dialogBody}>
	<p>
		<F
			defaultMessage="Have a bug, issue, or idea for svelte-draw? Let us know! Fill out this form and we will follow up over email if needed. You can also <discord>chat with us on Discord</discord> or <github>submit an issue on GitHub</github>."
			tags={{ discord, github }}
		/>
	</p>
	<textarea
		placeholder="Please provide as much detail as possible."
		value={initialDescription}
		oninput={(e) => {
			setInLocalStorage(descriptionKey, e.currentTarget.value)
		}}
		class={styles.feedbackDialogTextArea}
		bind:this={input}
	></textarea>
</SvelteDrawUiDialogBody>
<SvelteDrawUiDialogFooter class="tlui-dialog__footer__actions">
	<div class="tlui-dialog__footer__file-link-checkbox">
		<SvelteDrawUiButton
			type="normal"
			onclick={() => (includeFileLink = !includeFileLink)}
			class={styles.feedbackDialogCheckbox}
		>
			<SvelteDrawUiButtonCheck checked={includeFileLink} />
			<SvelteDrawUiButtonLabel>
				<F defaultMessage="Include link to current file" />
			</SvelteDrawUiButtonLabel>
		</SvelteDrawUiButton>
	</div>
	<SvelteDrawUiButton type="normal" onclick={onClose}>
		<SvelteDrawUiButtonLabel>
			<F defaultMessage="Cancel" />
		</SvelteDrawUiButtonLabel>
	</SvelteDrawUiButton>
	<SvelteDrawUiButton type="primary" onclick={onSubmit} disabled={isSubmitting}>
		<SvelteDrawUiButtonLabel>
			<F defaultMessage="Submit" />
		</SvelteDrawUiButtonLabel>
	</SvelteDrawUiButton>
</SvelteDrawUiDialogFooter>
