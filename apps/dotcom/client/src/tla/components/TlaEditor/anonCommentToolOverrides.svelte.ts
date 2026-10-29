import { defineMessages, getTranslation, type TLUiOverrides } from 'svelte-draw'
import { getMaybeApp } from '../../hooks/useAppState.svelte'
import { getSvelteDrawAppUiEvents } from '../../utils/app-ui-events'
import TlaSignInDialog from '../dialogs/TlaSignInDialog.svelte'

const signInMessages = defineMessages({
	signInToComment: { defaultMessage: 'Sign in to comment' },
})

/** For signed-out viewers, the comment tool button and its `c` shortcut open the sign-in dialog
 *  instead of entering the tool. Compose after `commentToolOverrides`, which registers the tool.
 *  Was `useAnonCommentToolOverrides()`. */
export function getAnonCommentToolOverrides(): { readonly current: TLUiOverrides } {
	const msg = getTranslation()
	const app = getMaybeApp()
	const trackEvent = getSvelteDrawAppUiEvents()
	const ctaString = $derived(msg(signInMessages.signInToComment))
	const overrides = $derived.by((): TLUiOverrides => {
		if (app.current) return {}
		const cta = ctaString
		return {
			tools(_editor, tools, { addDialog }) {
				const comment = tools.comment
				if (comment) {
					comment.onSelect = () => {
						trackEvent('sign-up-clicked', { source: 'comments', ctaMessage: cta })
						addDialog({ component: TlaSignInDialog })
					}
				}
				return tools
			},
		}
	})
	return {
		get current() {
			return overrides
		},
	}
}
