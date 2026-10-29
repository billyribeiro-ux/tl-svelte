<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const signInMessages = defineMessages({
		signInToComment: { defaultMessage: 'Sign in to comment' },
	})
</script>

<script lang="ts">
	import { F, fromComputed, getDialogs, getEditor, getTranslation } from 'svelte-draw'
	import { getMaybeApp } from '../../hooks/useAppState.svelte'
	import { getSvelteDrawAppUiEvents } from '../../utils/app-ui-events'
	import TlaSignInDialog from '../dialogs/TlaSignInDialog.svelte'
	import TlaCtaButton from '../TlaCtaButton/TlaCtaButton.svelte'

	/** Anon viewers read comments but don't compose — the toolkit's `ComposerFallback` slot holds
	 *  this sign-in prompt (registered via `CommentTool.configure` in `TlaEditor`). */
	// The slot passes the surface it renders in; the prompt is the same for both.
	let { context: _context }: { context: 'pending' | 'thread' } = $props()

	const msg = getTranslation()
	const editor = getEditor()
	// Fallback slots render for every non-composing session; the CTA is only honest for a
	// signed-out visitor on an editable canvas — signing in unlocks nothing on view-only.
	const isReadonly = fromComputed('isReadonly', () => editor.getIsReadonly())
	const app = getMaybeApp()
	const { addDialog } = getDialogs()
	const trackEvent = getSvelteDrawAppUiEvents()
</script>

{#if !isReadonly.current && !app.current}
	<TlaCtaButton
		canvas
		data-testid="tla-sign-in-to-comment-button"
		onclick={() => {
			trackEvent('sign-up-clicked', {
				source: 'comments',
				ctaMessage: msg(signInMessages.signInToComment),
			})
			addDialog({ component: TlaSignInDialog })
		}}
	>
		<F {...signInMessages.signInToComment} />
	</TlaCtaButton>
{/if}
